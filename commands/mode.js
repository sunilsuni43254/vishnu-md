import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'media', 'asura_db.json');

// Database Helper Functions
const getDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) return {};
        return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    } catch (e) {
        return {};
    }
};

const saveDB = (data) => {
    if (!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const ownerNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";

        // Powerful Ownership Check
        const isOwner = sender.includes(ownerNumber.split('@')[0]) || msg.key.fromMe;

        if (!isOwner) {
            return sock.sendMessage(chat, { text: "⚠️ *Access Denied:* This command is restricted to the Bot Owner." }, { quoted: msg });
        }

        const mode = args[0]?.toLowerCase();

        if (mode === 'public' || mode === 'private') {
            const db = getDB();
            db.botMode = mode;
            saveDB(db);

            const statusEmoji = mode === 'public' ? '🔓' : '🔐';
            return sock.sendMessage(chat, { 
                text: `${statusEmoji} *System Update:* Bot mode has been successfully switched to *${mode.toUpperCase()}*.` 
            }, { quoted: msg });
            
        } else {
            return sock.sendMessage(chat, { 
                text: "❓ *Usage:* `.mode public` or `.mode private`" 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Mode Command Error:", error);
    }
};
