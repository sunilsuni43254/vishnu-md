import fs from 'fs';

export default async (sock, msg, args) => {
    try {
        const chat = msg.key.remoteJid;
        const dbPath = './media/asura_db.json';
        
        // 1. Check if input is valid
        if (!args[0] || (args[0].toLowerCase() !== 'on' && args[0].toLowerCase() !== 'off')) {
            return await sock.sendMessage(chat, { text: "⚠️ *Usage:* .antispam on/off" }, { quoted: msg });
        }

        const status = args[0].toLowerCase() === 'on';

        // 2. Read and update Database
        let db = {};
        if (fs.existsSync(dbPath)) {
            db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        }

        if (!db[chat]) db[chat] = {};
        db[chat].antispam = status;

        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

        // 3. Success Message
        const responseText = `🛡️ *ANTISPAM CONTROL*\n\n✅ Status: *${status ? 'ENABLED' : 'DISABLED'}*\n📝 Group: ${chat}\n\n*Note:* Repeated messages will be deleted automatically.`;
        
        await sock.sendMessage(chat, { text: responseText }, { quoted: msg });

    } catch (error) {
        console.error("Antispam Command Error:", error);
        await sock.sendMessage(msg.key.remoteJid, { text: "❌ *Error:* Failed to update settings." });
    }
};
