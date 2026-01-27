import fs from 'fs';

export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        const dbPath = './media/asura_db.json';

        // 1. Check if it's a group
        if (!chat.endsWith('@g.us')) {
            return sock.sendMessage(chat, { text: "❌ This command can only be used in groups." });
        }

        // 2. Validate input
        const action = args[0]?.toLowerCase();
        if (action !== 'on' && action !== 'off') {
            return sock.sendMessage(chat, { text: "❓ Usage: *.antilink on* or *.antilink off*" });
        }

        // 3. Read and Update Database
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }

        if (!db[chat]) db[chat] = {};
        db[chat].antilink = (action === 'on');

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // 4. Success Message
        const status = action === 'on' ? "ENABLED 🛡️" : "DISABLED ❌";
        await sock.sendMessage(chat, { 
            text: `✅ *ANTILINK SYSTEM:* ${status}\n\n*Note:* All external links will be automatically removed and senders will be kicked.` 
        }, { quoted: msg });

    } catch (e) {
        console.error("Antilink Command Error:", e);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ Error updating database." });
    }
};
