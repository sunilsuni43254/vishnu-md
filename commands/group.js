import fs from 'fs';

// Database simulation to store settings locally
const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const saveDB = (data) => fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // --- 1. Help Menu Design ---
    if (!args[0] || args[0].toLowerCase() === 'help') {
        const helpText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *\`👺Asura MD\`* 」
*╰──────────────❂*
╔━━━━━━━━━━━━❥❥❥
┃ 🛡️ *👺ULTIMATE GROUP MASTER*
┃
┃🔹🆔️ .group id
┃🔹➕ .group add [number]
┃🔹🦶 .group kick [tag/reply]
┃🔹🤴 .group promot/demote [tag]
┃🔹🔖 .group tagall [message]
┃🔹🔐 .group lock/unlock
┃🔹❌ .group delete [reply]
┃🔹⏰ .group schedule [min] [text]
┃🔹🏷 .group name/bio [text]
┃🔹🥰 .group join [link]
┃
┃✨ *SECURITY CONTROLS:*
┃🔹🙏 .group welcome on/off
┃🔹🔗 .group antilink on/off
┃🔹🚫 .group antidelete on/off
┃🔹🦠 .group antispam on/off
┃🔹🌏 .group antiforeign on/off
┃🔹📞 .group anticall on/off
┃🔹🤖 .group chatbot on/off
┃
┃💡 *Note:* DM-ൽ JID വെച്ചും ഉപയോഗിക്കാം
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;

        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { audio: { url: songPath }, mimetype: "audio/ogg; codecs=opus", ptt: true });
        }
        return sock.sendMessage(chat, { text: helpText }, { quoted: msg });
    }

    try {
        // --- 2. Target & Action Logic (Fixed) ---
        let targetGroup = chat;
        let action;
        let valueStartIdx;

        // ചെക്ക് ചെയ്യുന്നു: ആദ്യത്തെ വാക്ക് JID ആണോ? (.group 1203xxx@g.us add)
        if (args[0].includes('@g.us')) {
            targetGroup = args[0];
            action = args[1]?.toLowerCase();
            valueStartIdx = 2;
        } else {
            targetGroup = chat;
            action = args[0]?.toLowerCase();
            valueStartIdx = 1;
        }

        if (!action) return;

        const value = args.slice(valueStartIdx).join(' ');
        const db = getDB();

        // User target detection (Reply, Tag, or Number)
        const quoted = msg.message?.extendedTextMessage?.contextInfo;
        let user = quoted?.participant || quoted?.mentionedJid?.[0] || (args[valueStartIdx] ? args[valueStartIdx].replace(/[^0-9]/g, '') + '@s.whatsapp.net' : null);

        // --- 3. Command Switch System ---
        switch (action) {
            case 'id':
                return sock.sendMessage(chat, { text: `📍 *Chat ID:* ${targetGroup}` }, { quoted: msg });

            case 'welcome':
            case 'antilink':
            case 'antidelete':
            case 'antispam':
            case 'antiforeign':
            case 'chatbot':
                if (!db[targetGroup]) db[targetGroup] = {};
                db[targetGroup][action] = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `✅ *${action.toUpperCase()}* is now *${value.toUpperCase()}* for ${targetGroup}` });

            case 'anticall':
                if (!db['global']) db['global'] = {};
                db['global'].anticall = (value === 'on');
                saveDB(db);
                return sock.sendMessage(chat, { text: `🛡️ *ANTI-CALL* is now *${value.toUpperCase()}* (Global Setting)` });

            case 'tagall':
                const metadata = await sock.groupMetadata(targetGroup);
                const participants = metadata.participants.map(p => p.id);
                return sock.sendMessage(targetGroup, { text: `📢 *${value || 'Attention everyone!'}*`, mentions: participants });

            case 'add':
                if (!user) return sock.sendMessage(chat, { text: "❌ Please provide a number or reply to a user." });
                await sock.groupParticipantsUpdate(targetGroup, [user], "add");
                break;

            case 'kick':
                if (!user) return sock.sendMessage(chat, { text: "❌ Please tag or reply to a user." });
                await sock.groupParticipantsUpdate(targetGroup, [user], "remove");
                break;

            case 'promot':
                await sock.groupParticipantsUpdate(targetGroup, [user], "promote");
                break;

            case 'demote':
                await sock.groupParticipantsUpdate(targetGroup, [user], "demote");
                break;

            case 'lock':
                await sock.groupSettingUpdate(targetGroup, 'announcement');
                break;

            case 'unlock':
                await sock.groupSettingUpdate(targetGroup, 'not_announcement');
                break;

            case 'delete':
                if (!quoted) return sock.sendMessage(chat, { text: "❌ Please reply to the message you want to delete." });
                await sock.sendMessage(targetGroup, { delete: { remoteJid: targetGroup, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
                break;

            case 'name':
                if (!value) return sock.sendMessage(chat, { text: "❌ Please provide a name." });
                await sock.groupUpdateSubject(targetGroup, value);
                break;

            case 'bio':
                if (!value) return sock.sendMessage(chat, { text: "❌ Please provide a bio." });
                await sock.groupUpdateDescription(targetGroup, value);
                break;

            case 'schedule':
                const schedTime = parseInt(args[valueStartIdx]);
                const schedMsg = args.slice(valueStartIdx + 1).join(' ');
                if (isNaN(schedTime) || !schedMsg) return sock.sendMessage(chat, { text: "❌ Format: .group schedule [mins] [message]" });
                sock.sendMessage(chat, { text: `🕒 Message scheduled in ${schedTime} minute(s).` });
                setTimeout(() => {
                    sock.sendMessage(targetGroup, { text: schedMsg });
                }, schedTime * 60000);
                break;

            case 'join':
                const link = args[valueStartIdx];
                if (!link || !link.includes('chat.whatsapp.com/')) return sock.sendMessage(chat, { text: "❌ Invalid link." });
                const code = link.split('.com/')[1];
                await sock.groupAcceptInvite(code);
                return sock.sendMessage(chat, { text: "✅ Joined successfully!" });

            default:
                return sock.sendMessage(chat, { text: "❌ Unknown command. Use *.group help* to see all commands." });
        }

        await sock.sendMessage(chat, { text: `✅ *Executed:* ${action.toUpperCase()}` });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ *Failed:* Check if I am an Admin or if the JID is correct." });
    }
};
