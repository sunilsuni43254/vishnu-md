
import fs from 'fs';

// Path to store your custom filters
const DATA_PATH = './filters.json';

// Initialize JSON file if it doesn't exist
if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({}));
}

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ").toLowerCase();
    const isReply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    // Load existing filters
    let filters = JSON.parse(fs.readFileSync(DATA_PATH));

    // 1. SETTING A FILTER (Example: .filter .hello)
    if (text.startsWith('.filter')) {
        const cmdName = text.replace('.filter', '').trim();
        
        if (!isReply) {
            return await sock.sendMessage(chat, { text: "❌ *Error:* Please reply to a message (image, video, sticker, or text) to set it as a filter." });
        }
        if (!cmdName) {
            return await sock.sendMessage(chat, { text: "❌ *Error:* Provide a name. Example: `.filter .d`" });
        }

        // Store the quoted message structure directly (No download needed)
        filters[cmdName] = msg.message.extendedTextMessage.contextInfo.quotedMessage;
        fs.writeFileSync(DATA_PATH, JSON.stringify(filters, null, 2));

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
        return await sock.sendMessage(chat, { text: `Successfully set filter for *${cmdName}*` });
    }

    // 2. TRIGGERING A FILTER (Example: User types .d)
    const trigger = text.trim();
    if (filters[trigger]) {
        const savedMsg = filters[trigger];
        
        // Forward the saved message structure
        // This sends the exact content (image, video, sticker, etc.) without downloading
        await sock.sendMessage(chat, { forward: { message: { ...savedMsg }, key: { remoteJid: chat } } }, { quoted: msg });
        
        await sock.sendMessage(chat, { react: { text: "📝", key: msg.key } });
        return;
    }

    // 3. DELETE A FILTER (Optional helper)
    if (text.startsWith('.stop')) {
        const cmdToStop = text.replace('.stop', '').trim();
        if (filters[cmdToStop]) {
            delete filters[cmdToStop];
            fs.writeFileSync(DATA_PATH, JSON.stringify(filters, null, 2));
            return await sock.sendMessage(chat, { text: `Filter *${cmdToStop}* deleted.` });
        }
    }
};
