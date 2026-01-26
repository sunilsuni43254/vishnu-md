import fs from 'fs';

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const value = args[0]?.toLowerCase();
    const db = getDB();

    // ബോട്ട് ഉടമസ്ഥനാണോ എന്ന് പരിശോധിക്കുന്നു
    const ownerNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const isOwner = msg.key.participant === ownerNumber || msg.key.remoteJid === ownerNumber || msg.key.fromMe;

    if (!isOwner) return sock.sendMessage(chat, { text: "❌Only owners." });

    if (value === 'public' || value === 'private') {
        db.botMode = value;
        saveDB(db);
        return sock.sendMessage(chat, { text: `⚙️ Bot Mode *${value.toUpperCase()}* Changed.` });
    } else {
        return sock.sendMessage(chat, { text: "❓ How to Use: *.mode public* or *.mode private*" });
    }
};
