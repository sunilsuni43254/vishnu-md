export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    
    if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഗ്രൂപ്പുകളിൽ മാത്രമേ പ്രവർത്തിക്കൂ!" }, { quoted: msg });

    const command = args[0]?.toLowerCase();
    const groupMetadata = await sock.groupMetadata(chat);
    const participants = groupMetadata.participants;
    
    // --- അഡ്മിൻ ചെക്കിംഗ് ഫിക്സ്ഡ് ---
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const userJid = msg.key.participant || msg.key.remoteJid;
    
    const botAdmin = participants.find(p => p.id === botId)?.admin;
    const userAdmin = participants.find(p => p.id === userJid)?.admin;

    const isBotAdmin = botAdmin === 'admin' || botAdmin === 'superadmin';
    const isUserAdmin = userAdmin === 'admin' || userAdmin === 'superadmin';

    // --- How to Use ---
    if (!command) {
        return sock.sendMessage(chat, { 
            text: `🛡️ *ASURA ULTIMATE GROUP MANAGER*\n\n` +
                 `📜 *COMMANDS:* \n` +
                 `🔹 .group add [91xx]\n` +
                 `🔹 .group kick [reply/tag]\n` +
                 `🔹 .group promot [reply/tag]\n` +
                 `🔹 .group demote [reply/tag]\n` +
                 `🔹 .group delete [reply]\n` +
                 `🔹 .group lock (Only admins)\n` +
                 `🔹 .group unlock (Everyone)\n` +
                 `🔹 .group link (Invite link)\n` +
                 `🔹 .group revoke (Reset link)\n` +
                 `🔹 .group name [text]\n` +
                 `🔹 .group bio [text]\n` +
                 `🔹 .group mention [text]\n` +
                 `🔹 .group settings (Everyone settings)\n\n` +
                 `💡 *Note:* ബോട്ട് അഡ്മിൻ ആണെന്ന് ഉറപ്പാക്കുക.`
        }, { quoted: msg });
    }

    if (!isUserAdmin) return sock.sendMessage(chat, { text: "❌ *Admin Only:* നിങ്ങൾ ഒരു ഗ്രൂപ്പ് അഡ്മിൻ അല്ല!" });
    if (!isBotAdmin) return sock.sendMessage(chat, { text: "❌ *Bot Admin Required:* എനിക്ക് അഡ്മിൻ പവർ നൽകുക!" });

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    let target = quotedMsg?.participant || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    try {
        switch (command) {
            case 'add':
                if (!target) return sock.sendMessage(chat, { text: "👤 നമ്പർ നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 ആളെ ടാഗ് ചെയ്യുകയോ റിപ്ലൈ നൽകുകയോ ചെയ്യുക." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                break;

            case 'promot':
                if (!target) return sock.sendMessage(chat, { text: "👤 റിപ്ലൈ നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                break;

            case 'demote':
                if (!target) return sock.sendMessage(chat, { text: "👤 റിപ്ലൈ നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "demote");
                break;

            case 'delete':
                if (!quotedMsg) return sock.sendMessage(chat, { text: "🗑️ മെസ്സേജിന് റിപ്ലൈ നൽകുക." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: quotedMsg.participant === botId, id: quotedMsg.stanzaId, participant: quotedMsg.participant } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 അഡ്മിൻമാർക്ക് മാത്രമേ സംസാരിക്കാൻ കഴിയൂ." });
                break;

            case 'unlock':
                await sock.groupSettingUpdate(chat, 'not_announcement');
                await sock.sendMessage(chat, { text: "🔓 എല്ലാവർക്കും സംസാരിക്കാം." });
                break;

            case 'settings':
                await sock.groupSettingUpdate(chat, 'locked');
                await sock.sendMessage(chat, { text: "⚙️ ഗ്രൂപ്പ് ഇൻഫോ മാറ്റാനുള്ള അനുവാദം അഡ്മിന്മാർക്ക് മാത്രമാക്കി." });
                break;

            case 'link':
                const code = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 https://chat.whatsapp.com/${code}` });
                break;

            case 'revoke':
                await sock.groupRevokeInvite(chat);
                await sock.sendMessage(chat, { text: "🔄 ഗ്രൂപ്പ് ലിങ്ക് റീസെറ്റ് ചെയ്തു." });
                break;

            case 'name':
                if (!args[1]) return sock.sendMessage(chat, { text: "📝 പേര് നൽകുക." });
                await sock.groupUpdateSubject(chat, args.slice(1).join(' '));
                break;

            case 'bio':
                if (!args[1]) return sock.sendMessage(chat, { text: "📝 വിവരം നൽകുക." });
                await sock.groupUpdateDescription(chat, args.slice(1).join(' '));
                break;

            case 'mention':
                const members = participants.map(p => p.id);
                await sock.sendMessage(chat, { text: `📢 ${args.slice(1).join(' ') || 'Hello!'}`, mentions: members });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്!" });
        }
    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ ഒരു എറർ സംഭവിച്ചു. ബോട്ട് അഡ്മിൻ ആണെന്ന് ഉറപ്പാക്കുക." });
    }
};
