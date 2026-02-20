import { 
    makeWASocket, 
    useMultiFileAuthState, 
    fetchLatestBaileysVersion, 
    makeInMemoryStore,
    DisconnectReason 
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';

// മെമ്മറി സ്പീഡ് കൂട്ടാൻ സ്റ്റോർ ഉപയോഗിക്കുന്നു
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

export default async function pairCommand(sock, msg, args) {
    const remoteJid = msg.key.remoteJid;
    const phoneNumber = args[0]?.replace(/[^0-9]/g, '');

    if (!phoneNumber) {
        return await sock.sendMessage(remoteJid, { text: "❌ Please provide a phone number.\nExample: `.pair 919876XXXXX" }, { quoted: msg });
    }

    // ഓരോ യൂസർക്കും പ്രത്യേക ഫോൾഡർ
    const authPath = `./sessions/${phoneNumber}/`;
    if (!fs.existsSync(authPath)) fs.mkdirSync(authPath, { recursive: true });

    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const { version } = await fetchLatestBaileysVersion();

    try {
        const userSock = makeWASocket({
            auth: state,
            version,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: ["ASURA-MD", "Asura", "asura-MD"]
        });

        store.bind(userSock.ev);

        // 1. പെയറിംഗ് കോഡ് ജനറേഷൻ
        if (!userSock.authState.creds.registered) {
            setTimeout(async () => {
                let code = await userSock.requestPairingCode(phoneNumber);
                code = code?.toUpperCase()?.match(/.{1,4}/g)?.join("-") || code;
                
                await sock.sendMessage(remoteJid, { 
                    text: `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Asura MD PAIR CODE*
*✧* 「 \`👺Asura MD\` 」
*╰──────────❂*
╭━━❐━━━━━━⪼
┇๏  *_🔯Prefixes: . , ! # $ & @_*
┇๏  *🌟_ASURA-MDMini WhatsApp Bot_ 🌟*
┇๏  *🤖_Your Personal WhatsApp Assistant_🔥*
┇๏  *📜 _Send ".help" For Commands_*
┇๏  *_👺 ASURA MD ᴠ2.0_*
╰━━❑━━━━━━⪼
*╭━━〔 🤖 ASURA PAIRING 〕━━┈⊷*
┃
┃ 🔑 *YOUR CODE*
┃ \`\`\`${code}\`\`\`
┃
*╰━━━━━━━━━━━━━━━┈⊷*

*🤔 HOW TO USE:*
━━━━━━━━━━━━━━━━
_1. Open WhatsApp > Settings._
_2. Linked Devices 👉 Link a Device._
_3. Link with phone number instead._
_4. Paste the code above._

> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*` 
                }, { quoted: msg });
            }, 3000);
        }

           // 2. Command Handler for the linked user
        userSock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                if (!m.message) return; 
                
                const messageContent = m.message.conversation || m.message.extendedTextMessage?.text || "";
                if (!messageContent.startsWith('.')) return; 

                const parts = messageContent.trim().split(/ +/);
                const commandName = parts[0].slice(1).toLowerCase();
                const cmdArgs = parts.slice(1);

                const commandFile = `${commandName}.js`;
                const commandPath = path.join(process.cwd(), 'commands', commandFile);

                if (fs.existsSync(commandPath)) {
                    // Dynamic Import
                    const commandModule = await import(pathToFileURL(commandPath).href + `?update=${Date.now()}`);
                    const runCommand = commandModule.default;

                    if (typeof runCommand === 'function') {
                        await runCommand(userSock, m, cmdArgs); 
                    }
                } else {
                    // Default response if command not found
                    if(commandName === 'ping') await userSock.sendMessage(m.key.remoteJid, { text: "📡 *Pong!*" });
                }
            } catch (err) { console.error("Command Error:", err); }
        });

        userSock.ev.on('creds.update', saveCreds);

        userSock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === "open") {
                await sock.sendMessage(remoteJid, { text: `✅ *${phoneNumber}* Linked & Active!` });
            }
            if (connection === "close") {
                const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                if (!shouldReconnect) {
                    fs.rmSync(authPath, { recursive: true, force: true });
                }
            }
        });

    } catch (error) {
        console.error("Pairing Error:", error);
    }
}
