export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const command = args[0]?.toLowerCase();
    const isGroup = chat.endsWith('@g.us');
    
    // --- How to Use ---
    if (!command) {
        return sock.sendMessage(chat, { 
            text: `🛡️ *ASURA ULTIMATE GROUP MANAGER*\n\n` +
                 `📜 *COMMANDS:* \n` +
                 `🔹 .group id (ഗ്രൂപ്പ് ID അറിയാൻ)\n` +
                 `🔹 .group add [91xx]\n` +
                 `🔹 .group kick [reply/tag]\n` +
                 `🔹 .group promot [reply/tag]\n` +
                 `🔹 .group demote [reply/tag]\n` +
                 `🔹 .group delete [reply]\n` +
                 `🔹 .group lock / .group unlock\n` +
                 `🔹 .group link / .group revoke\n` +
                 `🔹 .group name / .group bio\n` +
                 `🔹 .group tag [text] (Mention All)\n` +
                 `🔹 .group join [link] (ഗ്രൂപ്പിൽ കയറാൻ)\n\n` +
                 `💡 *DM Control:* ഗ്രൂപ്പ് ID ഉണ്ടെങ്കിൽ പ്രൈവറ്റ് ചാറ്റിലൂടെയും നിയന്ത്രിക്കാം.`
        }, { quoted: msg });
    }

    try {
        // --- Join Command (DM-ലും ഗ്രൂപ്പിലും വർക്ക് ആകും) ---
        if (command === 'join') {
            const link = args[1];
            if (!link || !link.includes('chat.whatsapp.com')) return sock.sendMessage(chat, { text: "❌ ശരിയായ ഗ്രൂപ്പ് ലിങ്ക് നൽകൂ." });
            const code = link.split('chat.whatsapp.com/')[1];
            await sock.groupAcceptInvite(code);
            return sock.sendMessage(chat, { text: "✅ ഗ്രൂപ്പിൽ ജോയിൻ ചെയ്തു!" });
        }

        // --- ഗ്രൂപ്പ് ചെക്കിംഗ് ---
        if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഗ്രൂപ്പിൽ ഉപയോഗിക്കൂ, അല്ലെങ്കിൽ ഗ്രൂപ്പ് ID സഹിതം ഉപയോഗിക്കൂ." });

        const groupMetadata = await sock.groupMetadata(chat);
        const participants = groupMetadata.participants;
        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
        const userJid = msg.key.participant || msg.key.remoteJid;

        // --- അഡ്മിൻ ചെക്കിംഗ് (100% ഫിക്സ്ഡ് ലോജിക്) ---
        const getAdmin = (p) => participants.find(x => x.id === p)?.admin;
        const isBotAdmin = getAdmin(botId) !== undefined;
        const isUserAdmin = getAdmin(userJid) !== undefined;

        if (!isUserAdmin) return sock.sendMessage(chat, { text: "❌ നിങ്ങൾ ഒരു അഡ്മിൻ അല്ല!" });
        if (!isBotAdmin && command !== 'id') return sock.sendMessage(chat, { text: "❌ എനിക്ക് അഡ്മിൻ പവർ ഇല്ല!" });

        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        let target = quotedMsg?.participant || (args[1] && args[1].includes('@') ? args[1] : args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        switch (command) {
            case 'id':
                await sock.sendMessage(chat, { text: `📍 *Group ID:* ${chat}` });
                break;

            case 'add':
                if (!target) return sock.sendMessage(chat, { text: "👤 നമ്പർ നൽകൂ." });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 ആളെ ടാഗ് ചെയ്യൂ." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                break;

            case 'promot':
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                break;

            case 'demote':
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                break;

            case 'delete':
                if (!quotedMsg) return sock.sendMessage(chat, { text: "🗑️ മെസ്സേജിന് റിപ്ലൈ നൽകൂ." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: false, id: quotedMsg.stanzaId, participant: quotedMsg.participant } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                break;

            case 'link':
                const code = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 https://chat.whatsapp.com/${code}` });
                break;

            case 'revoke':
                await sock.groupRevokeInvite(chat);
                await sock.sendMessage(chat, { text: "🔄 ലിങ്ക് റീസെറ്റ് ചെയ്തു." });
                break;

            case 'name':
                await sock.groupUpdateSubject(chat, args.slice(1).join(' '));
                break;

            case 'bio':
                await sock.groupUpdateDescription(chat, args.slice(1).join(' '));
                break;

            case 'tag':
            case 'mention':
                const members = participants.map(p => p.id);
                await sock.sendMessage(chat, { text: `📢 ${args.slice(1).join(' ') || 'Attention!'}`, mentions: members });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്!" });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ എറർ! ബോട്ട് അഡ്മിൻ ആണെന്ന് ഉറപ്പാക്കുക." });
    }
};
