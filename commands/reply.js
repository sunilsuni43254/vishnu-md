export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    if (!global.autoResponseMap) global.autoResponseMap = {};

    // 1. DELETE ALL REPLIES (.reply delall)
    if (args[0] === 'delall') {
        global.autoResponseMap = {};
        return await sock.sendMessage(chat, { text: "🗑️ *All saved replies have been deleted from memory.*" });
    }

    // 2. DELETE SPECIFIC REPLY (.reply del [trigger])
    if (args[0] === 'del') {
        const triggerToDelete = args.slice(1).join(" ").toLowerCase().trim();
        if (!triggerToDelete) return await sock.sendMessage(chat, { text: "⚠️ Please provide the word to delete. \nExample: `.reply del hi`" });

        if (global.autoResponseMap[triggerToDelete]) {
            delete global.autoResponseMap[triggerToDelete];
            return await sock.sendMessage(chat, { text: `✅ Deleted reply for: *"${triggerToDelete}"*` });
        } else {
            return await sock.sendMessage(chat, { text: "❌ That trigger was not found in memory." });
        }
    }

    // 3. SETTING A NEW REPLY (By Swiping/Replying)
    if (args.length > 0 && args[0] !== 'del' && args[0] !== 'delall') {
        const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return await sock.sendMessage(chat, { 
                text: "⚠️ *Instruction:* Reply to a message and type `.reply [your response]`" 
            });
        }

        const trigger = (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "").toLowerCase().trim();
        const response = args.join(" ");

        if (!trigger) return await sock.sendMessage(chat, { text: "❌ Error: Only text triggers allowed." });

        global.autoResponseMap[trigger] = response;
        return await sock.sendMessage(chat, { text: `✅ *Set!* \nTrigger: "${trigger}" \nResponse: "${response}"` });
    }

    // 4. BACKGROUND LISTENER
    if (!global.replyHandlerInitialized) {
        global.replyHandlerInitialized = true;
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            const m = chatUpdate.messages[0];
            if (!m.message || m.key.fromMe) return;
            const incomingText = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase().trim();
            if (global.autoResponseMap[incomingText]) {
                await sock.sendMessage(m.key.remoteJid, { text: global.autoResponseMap[incomingText] }, { quoted: m });
            }
        });
    }

    // 5. SHOW HELP MENU
    if (args.length === 0) {
        let list = Object.keys(global.autoResponseMap);
        let status = list.length > 0 ? `📝 *Saved Triggers:* \n${list.join(", ")}` : "No replies saved yet.";
        
        await sock.sendMessage(chat, { 
            text: `🤖 *Auto-Reply Manager*\n\n1. *To Set:* Reply to a text + \`.reply [message]\` \n2. *To Delete One:* \`.reply del [trigger]\` \n3. *To Delete All:* \`.reply delall\` \n\n${status}` 
        });
    }
};
