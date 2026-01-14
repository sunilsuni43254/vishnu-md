export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');

    // 1. ഗ്രൂപ്പ് ആണോ എന്ന് പരിശോധിക്കുന്നു
    if (!isGroup) return await sock.sendMessage(chat, { text: "❌ This command only works in groups!" });

    const groupMetadata = await sock.groupMetadata(chat);
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // 2. ബോട്ട് അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുന്നു
    const isBotAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
    if (!isBotAdmin) return await sock.sendMessage(chat, { text: "❌ I need to be an *Admin* to kick someone!" });

    // 3. കമാൻഡ് അയച്ച ആൾ അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുന്നു
    const sender = msg.key.participant || msg.key.remoteJid;
    const isSenderAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin;
    if (!isSenderAdmin) return await sock.sendMessage(chat, { text: "❌ Only *Group Admins* can use this command!" });

    // 4. ആരെയാണ് കിക്ക് ചെയ്യേണ്ടതെന്ന് കണ്ടെത്തുന്നു (Mention അല്ലെങ്കിൽ Reply)
    let users = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (msg.message.extendedTextMessage?.contextInfo?.quotedMessage) {
        users.push(msg.message.extendedTextMessage.contextInfo.participant);
    }

    if (users.length === 0) return await sock.sendMessage(chat, { text: "⚠️ Please *mention* or *reply* to the user you want to kick." });

    for (let user of users) {
        // ബോട്ടിനെ തന്നെ കിക്ക് ചെയ്യാൻ നോക്കിയാൽ
        if (user === botId) continue;

        try {
            await sock.groupParticipantsUpdate(chat, [user], "remove");
            await sock.sendMessage(chat, { 
                text: `✅ Successfully removed @${user.split('@')[0]} from the group.`,
                mentions: [user]
            });
        } catch (e) {
            await sock.sendMessage(chat, { text: `❌ Could not kick @${user.split('@')[0]}` });
        }
    }
};
