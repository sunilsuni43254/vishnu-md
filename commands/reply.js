export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const sender = msg.key.participant || msg.key.remoteJid;
    
    // Initialize global storage in memory (No Database Save)
    if (!global.autoResponseMap) global.autoResponseMap = {};

    // Admin Check Logic
    let isAdmin = false;
    if (isGroup) {
        const groupMetadata = await sock.groupMetadata(chat);
        const participants = groupMetadata.participants;
        const user = participants.find(p => p.id === sender);
        isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin';
    } else {
        isAdmin = true; 
    }

    // Helper Function for Human-like Typing
    const sendWithTyping = async (jid, text, quoted = null) => {
        await sock.sendPresenceUpdate('composing', jid); // Typing... effect
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5s delay for realism
        await sock.sendMessage(jid, { text: text }, { quoted: quoted });
        await sock.sendPresenceUpdate('paused', jid);
    };

    // 1. DELETE ALL REPLIES
    if (args[0] === 'delall') {
        if (!isAdmin) return await sendWithTyping(chat, "❌ *Access Denied:* Only Admins can clear the database.");
        global.autoResponseMap = {};
        return await sendWithTyping(chat, "🗑️ *Database Cleared:* All auto-replies have been removed.");
    }

    // 2. DELETE SPECIFIC REPLY
    if (args[0] === 'del') {
        if (!isAdmin) return await sendWithTyping(chat, "❌ *Access Denied:* Admin privileges required.");
        const triggerToDelete = args.slice(1).join(" ").toLowerCase().trim();
        
        if (global.autoResponseMap[triggerToDelete]) {
            delete global.autoResponseMap[triggerToDelete];
            return await sendWithTyping(chat, `✅ *Successfully Deleted:* "${triggerToDelete}"`);
        } else {
            return await sendWithTyping(chat, "❌ *Error:* Trigger word not found.");
        }
    }

    // 3. SETTING A NEW REPLY
    if (args.length > 0 && args[0] !== 'del' && args[0] !== 'delall') {
        if (!isAdmin) return await sendWithTyping(chat, "❌ *Access Denied:* Only Admins can set auto-replies.");
        
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quotedMsg) {
            return await sendWithTyping(chat, "⚠️ *How to use:*\n\n1. Reply to the message you want to trigger.\n2. Type: `.reply [Your Response]`");
        }

        const trigger = (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "").toLowerCase().trim();
        const response = args.join(" ");

        if (!trigger) return await sendWithTyping(chat, "❌ *Error:* Only text-based messages can be used as triggers.");

        global.autoResponseMap[trigger] = response;
        return await sendWithTyping(chat, `✅ *Auto-Reply Set!*\n\n*Trigger:* ${trigger}\n*Response:* ${response}`);
    }

    // 4. BACKGROUND LISTENER (Optimized for performance)
    if (!global.replyHandlerInitialized) {
        global.replyHandlerInitialized = true;
        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                if (!m.message || m.key.fromMe) return;
                
                const incomingText = (m.message.conversation || m.message.extendedTextMessage?.text || "").toLowerCase().trim();
                const targetChat = m.key.remoteJid;

                if (global.autoResponseMap && global.autoResponseMap[incomingText]) {
                    // Typing effect for auto-replies
                    await sock.sendPresenceUpdate('composing', targetChat);
                    await new Promise(resolve => setTimeout(resolve, 1000)); 
                    await sock.sendMessage(targetChat, { 
                        text: global.autoResponseMap[incomingText] 
                    }, { quoted: m });
                }
            } catch (error) {
                console.error("Error in Auto-Reply Listener:", error);
            }
        });
    }

    // 5. STATUS / HELP MENU
    if (args.length === 0) {
        let list = Object.keys(global.autoResponseMap);
        let status = list.length > 0 ? `📝 *Active Triggers:* \n- ${list.join("\n- ")}` : "_No active replies set._";
        
        const menu = `
╭━━━〔 𓆩 👺ASURA MD 𓆪 〕━━━┈⊷
┃
┃ 🤖 *AUTO-REPLY SYSTEM*
┃
┃ ⊙ *Add:* Reply to a msg + \`.reply [text]\`
┃ ⊙ *Delete:* \`.reply del [trigger]\`
┃ ⊙ *Clear All:* \`.reply delall\`
┃
┃ ━━━━━━〔 STATUS 〕━━━━━━
┃
┃ ${status}
┃
╰━━━━━━━━━━━━━━━━━┈⊷`;
        await sendWithTyping(chat, menu);
    }
};
