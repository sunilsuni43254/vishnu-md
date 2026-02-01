import { makeWASocket, useMultiFileAuthState, delay, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";
import fs from 'fs';
import pino from 'pino';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let number = args[0]?.replace(/[^0-9]/g, '');

    if (!number) {
        return sock.sendMessage(chat, { 
            text: "❌ *Error: Number Missing!*\n\n*Usage:* `.pair 91xxxxxxxxxx`" 
        }, { quoted: msg });
    }

    await sock.sendMessage(chat, { text: "⏳ *Generating Pairing Code...* Please wait." });

    const subSessionPath = `./sessions/sub_${number}`;
    if (!fs.existsSync(subSessionPath)) {
        fs.mkdirSync(subSessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(subSessionPath);
    const { version } = await fetchLatestBaileysVersion();

    try {
        const tempSock = makeWASocket({
            version,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: ["Ubuntu", "Chrome", "20.0.04"]
        });

        if (!tempSock.authState.creds.registered) {
            await delay(3000); 
            const code = await tempSock.requestPairingCode(number);
            
            // കോഡ് ബ്ലോക്കിനുള്ളിൽ കൊടുത്താൽ സിംഗിൾ ടാപ്പിൽ കോപ്പി ചെയ്യാം
            const responseText = `
┌────────────┐
👺 ASURA MD ᴠ2.0
└────────────┘
╭━━❐━━━━━━⪼
┇๏ _*🔯Prefixes: . , ! # $ & @*_
┇๏  *🌟_ASURA-MDMini WhatsApp Bot_ 🌟*
┇๏ *🤖_Your Personal WhatsApp Assistant_🔥* 
┇๏ *📜 _Send ".help" For Commands_* 
╰━━❑━━━━━━⪼
*╭━━〔 🤖 ASURA PAIRING 〕━━┈⊷*
┃
┃ 🔑 *YOUR CODE*
┃ \`\`\`${code.toUpperCase()}\`\`\`
┃
*╰━━━━━━━━━━━━━━━┈⊷*

*🤔 HOW TO USE:*
━━━━━━━━━━━━━━━━
1. Open WhatsApp > Settings.
2. Go to 'Linked Devices' 👉 'Link a Device'.
3. Select 'Link with phone number instead'.
4. Tap and copy the code above and paste it.
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© Pᴏᴡᴇʀᴇᴅ Bʏ 👺 ASURA-MD ♡*`;

            await sock.sendMessage(chat, { text: responseText }, { quoted: msg });
        }

        tempSock.ev.on('creds.update', saveCreds);
        tempSock.ev.on('connection.update', async (update) => {
            if (update.connection === 'open') {
                await sock.sendMessage(chat, { text: `✅ *Success!* \n\nNumber *${number}* is now connected.` });
            }
        });

    } catch (error) {
        console.error("Pairing Error:", error);
        await sock.sendMessage(chat, { text: "❌ *Error:* Try again later." });
    }
};
