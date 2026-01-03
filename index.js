import makeWASocket, { 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion, 
    makeCacheableSignalKeyStore 
} from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";
import path from "path";
import { pathToFileURL } from 'url';
import readline from "readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startAsura() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    if (!sock.authState.creds.registered) {
        const phoneNumber = await question('\nEnter your Phone Number (with Country Code, eg: 91xxxx): ');
        const code = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        console.log(`\n\x1b[32mYOUR PAIRING CODE: \x1b[1m${code}\x1b[0m\n`);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startAsura();
        } else if (connection === 'open') {
            console.log('✅ Asura MD Connected Successfully!');

            // കണക്ട് ആയ ഉടൻ DM വരാനുള്ള ഭാഗം
            const myNumber = "919048044745@s.whatsapp.net"; // നിങ്ങളുടെ നമ്പർ ഇവിടെ നൽകുക
            const welcomeMsg = `*👺 Asura MD Connected!* \n\nഹലോ യജമാനനെ, അസുര എം.ഡി വിജയകരമായി കണക്ട് ആയിട്ടുണ്ട്. കമാൻഡുകൾ പ്രവർത്തിപ്പിക്കാൻ ഇപ്പോൾ തയ്യാറാണ്! ✨`;
            
            await sock.sendMessage(myNumber, { text: welcomeMsg });
        }
    });

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
            const prefix = "."; 
            
            if (!body.startsWith(prefix)) return;

            const args = body.slice(prefix.length).trim().split(/ +/);
            const commandName = args.shift().toLowerCase();

            const commandPath = path.join(process.cwd(), 'commands', `${commandName}.js`);

            if (fs.existsSync(commandPath)) {
                const command = await import(pathToFileURL(commandPath).href);
                const execute = command.default || command;
                await execute(sock, msg, args);
            }
        } catch (err) {
            console.log("Error in Command Handling: ", err);
        }
    });
}

startAsura();
