export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    
    // 1. ഗ്രൂപ്പ് ആണോ എന്ന് പരിശോധിക്കുന്നു
    if (!isGroup) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഗ്രൂപ്പുകളിൽ മാത്രമേ പ്രവർത്തിക്കൂ!" }, { quoted: msg });

    const command = args[0]?.toLowerCase();
    const groupMetadata = await sock.groupMetadata(chat);
    const participants = groupMetadata.participants;
    
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;
    const isUserAdmin = participants.find(p => p.id === msg.key.participant)?.admin;

    // --- How to Use (Help Menu) ---
    if (!command) {
        return sock.sendMessage(chat, { 
            text: `🛡️ *ASURA GROUP MANAGER*\n\n` +
                 `📜 *COMMAND LIST:*\n` +
                 `🔹 .group add 91xxx (അംഗത്തെ ചേർക്കാൻ)\n` +
                 `🔹 .group kick (അംഗത്തെ പുറത്താക്കാൻ)\n` +
                 `🔹 .group promot (അഡ്മിൻ ആക്കാൻ)\n` +
                 `🔹 .group pin (Reply to message)\n` +
                 `🔹 .group delete (Reply to message)\n` +
                 `🔹 .group lock (Admins only settings)\n` +
                 `🔹 .group link (Group invite link)\n` +
                 `🔹 .group name [New Name]\n` +
                 `🔹 .group bio [New Description]\n` +
                 `🔹 .group mention [Message]\n\n` +
                 `💡 *How to Use:* ഓരോ കമാൻഡിനും ശേഷം ആവശ്യമായ നമ്പർ നൽകുകയോ മെസ്സേജിന് മറുപടി നൽകുകയോ ചെയ്യുക.`
        }, { quoted: msg });
    }

    // അഡ്മിൻ പവർ ചെക്കിംഗ്
    if (!isUserAdmin) return sock.sendMessage(chat, { text: "❌ ഈ കമാൻഡ് ഉപയോഗിക്കാൻ നിങ്ങൾ അഡ്മിൻ ആകണം!" });
    if (!isBotAdmin) return sock.sendMessage(chat, { text: "❌ ബോട്ടിന് അഡ്മിൻ പവർ നൽകിയാൽ മാത്രമേ ഇവ പ്രവർത്തിക്കൂ!" });

    // ടാർഗെറ്റ് കണ്ടെത്തുന്നു (Reply വഴിയോ അല്ലെങ്കിൽ നമ്പറോ)
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
    let target = quotedMsg?.participant || (args[1] ? args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

    try {
        switch (command) {
            case 'add':
                if (!args[1]) return sock.sendMessage(chat, { text: "👤 ചേർക്കേണ്ട നമ്പർ നൽകുക. (.group add 91xx)" });
                await sock.groupParticipantsUpdate(chat, [target], "add");
                await sock.sendMessage(chat, { text: "✅ ചേർക്കാൻ ശ്രമിക്കുന്നു..." });
                break;

            case 'kick':
                if (!target) return sock.sendMessage(chat, { text: "👤 മാറ്റേണ്ട ആൾക്ക് മറുപടി (Reply) നൽകുക അല്ലെങ്കിൽ ടാഗ് ചെയ്യുക." });
                await sock.groupParticipantsUpdate(chat, [target], "remove");
                await sock.sendMessage(chat, { text: "✅ അംഗത്തെ നീക്കം ചെയ്തു." });
                break;

            case 'promot':
                if (!target) return sock.sendMessage(chat, { text: "👤 അഡ്മിൻ ആക്കേണ്ട ആൾക്ക് മറുപടി നൽകുക." });
                await sock.groupParticipantsUpdate(chat, [target], "promote");
                await sock.sendMessage(chat, { text: "✅ പുതിയ അഡ്മിനെ നിയമിച്ചു." });
                break;

            case 'pin':
                if (!quotedMsg?.stanzaId) return sock.sendMessage(chat, { text: "📌 പിൻ ചെയ്യേണ്ട മെസ്സേജിന് മറുപടി (Reply) നൽകുക." });
                // Note: ചില Baileys വേർഷനുകളിൽ pin മെസ്സേജ് സപ്പോർട്ട് വ്യത്യസ്തമായിരിക്കും.
                await sock.sendMessage(chat, { pin: { remoteJid: chat, fromMe: false, id: quotedMsg.stanzaId, participant: target } });
                break;

            case 'delete':
                if (!quotedMsg?.stanzaId) return sock.sendMessage(chat, { text: "🗑️ ഡിലീറ്റ് ചെയ്യേണ്ട മെസ്സേജിന് മറുപടി നൽകുക." });
                await sock.sendMessage(chat, { delete: { remoteJid: chat, fromMe: target === botId, id: quotedMsg.stanzaId, participant: target } });
                break;

            case 'lock':
                await sock.groupSettingUpdate(chat, 'announcement');
                await sock.sendMessage(chat, { text: "🔒 ഗ്രൂപ്പ് ലോക്ക് ചെയ്തു. ഇനി അഡ്മിന്മാർക്ക് മാത്രമേ മെസ്സേജ് അയക്കാൻ കഴിയൂ." });
                break;

            case 'link':
                const code = await sock.groupInviteCode(chat);
                await sock.sendMessage(chat, { text: `🔗 *Invite Link:*\nhttps://chat.whatsapp.com/${code}` });
                break;

            case 'name':
                const newName = args.slice(1).join(' ');
                if (!newName) return sock.sendMessage(chat, { text: "📝 പുതിയ പേര് നൽകുക. (.group name MyGroup)" });
                await sock.groupUpdateSubject(chat, newName);
                break;

            case 'bio':
                const newDesc = args.slice(1).join(' ');
                if (!newDesc) return sock.sendMessage(chat, { text: "📝 പുതിയ വിവരണം നൽകുക. (.group bio Hello All)" });
                await sock.groupUpdateDescription(chat, newDesc);
                break;

            case 'mention':
                const ment = participants.map(p => p.id);
                const txt = args.slice(1).join(' ') || "Hey everyone! 👋";
                await sock.sendMessage(chat, { text: `📢 *MENTION ALL*\n\n${txt}`, mentions: ment });
                break;

            default:
                await sock.sendMessage(chat, { text: "❌ തെറ്റായ കമാൻഡ്! ശരിയായ രീതി അറിയാൻ `.group` എന്ന് അയക്കുക." });
        }
    } catch (err) {
        console.error("Group Error:", err);
        await sock.sendMessage(chat, { text: "❌ എറർ! ബോട്ടിന് ആവശ്യമായ അനുവാദം ഉണ്ടോ എന്ന് നോക്കുക." });
    }
};
