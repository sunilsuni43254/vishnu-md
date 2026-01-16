export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const botId = sock.user.id.split(':')[0];
    const senderId = (msg.key.participant || msg.key.remoteJid).split('@')[0].split(':')[0];

    // 🛡️ OWNER ONLY (The person who linked the bot)
    const isOwner = botId === senderId;
    
    if (!global.autoResponseMap) global.autoResponseMap = {};

    // 1. DELETE ALL
    if (args[0] === 'delall' && isOwner) {
        global.autoResponseMap = {};
        return await sock.sendMessage(chat, { text: "🗑️ *Database Cleared by 𓆩 👺ASURA MD 𓆪*" });
    }

    // 2. DELETE SPECIFIC
    if (args[0] === 'del' && isOwner) {
        const trigger = args.slice(1).join(" ").toLowerCase().trim();
        if (global.autoResponseMap[trigger]) {
            delete global.autoResponseMap[trigger];
            return await sock.sendMessage(chat, { text: `✅ Deleted trigger: *${trigger}*` });
        }
    }

    // 3. SETTING REPLY (Supports Text, Image, Video, Audio, Voice)
    if (args.length > 0 && isOwner && args[0] !== 'del' && args[0] !== 'delall') {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) return await sock.sendMessage(chat, { text: "⚠️ Swipe/Reply to any message (Text/Media) and type `.reply`" });

        // Identify the trigger (The text you swiped on)
        const trigger = (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "").toLowerCase().trim();
        if (!trigger) return await sock.sendMessage(chat, { text: "❌ Swipe only on text messages to set them as triggers." });

        // Store the entire message object to avoid downloading
        global.autoResponseMap[trigger] = {
            message: msg.message.extendedTextMessage.contextInfo.quotedMessage,
            type: Object.keys(quotedMsg)[0]
        };

        return await sock.sendMessage(chat, { text: `✅ *Auto-Reply Linked!*\n\n*Trigger:* ${trigger}\n*Status:* Media/Text Saved in Memory.` });
    }

    // 4. BACKGROUND LISTENER (With Human-like Typing/Recording)
    if (!global.replyHandlerInitialized) {
        global.replyHandlerInitialized = true;
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;

            const incomingText = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase().trim();
            const data = global.autoResponseMap[incomingText];

            if (data) {
                // 📝 Human-like Effects
                const isAudio = data.type === 'audioMessage';
                await sock.sendPresenceUpdate(isAudio ? 'recording' : 'composing', m.key.remoteJid);
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 Seconds delay
                await sock.sendPresenceUpdate('paused', m.key.remoteJid);

                // 🚀 Send Response (Copy/Forward Method - No Download)
                await sock.sendMessage(m.key.remoteJid, { forward: { key: m.key, message: data.message } }, { quoted: m });
            }
        });
    }

    // 5. HELP MENU
    if (args.length === 0) {
        let list = Object.keys(global.autoResponseMap);
        let status = list.length > 0 ? `📝 *Active Triggers:* \n${list.join(", ")}` : "_No active replies._";
        const menu = `╭━━━〔 𓆩 👺ASURA MD 𓆪 〕━━━┈⊷
┃
┃ 🤖 *ADVANCED AUTO-REPLY*
┃
┃ ⊙ *To Set:* Reply to a msg + \`.reply\`
┃ ⊙ *Delete:* \`.reply del [trigger]\`
┃ ⊙ *Clear:* \`.reply delall\`
┃
┃ ━━━━━━〔 STATUS 〕━━━━━━
┃
┃ ${status}
┃
╰━━━━━━━━━━━━━━━━━┈⊷`;
        await sock.sendMessage(chat, { text: menu });
    }
};
