import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // ഗ്രൂപ്പിലാണോ എന്ന് നോക്കുന്നു
    if (!isGroup) {
        return sock.sendMessage(chat, { text: "❌ Only Group" });
    }

    try {
        const metadata = await sock.groupMetadata(chat);
        const participants = metadata.participants;
        
        let membersList = "";
        let mentions = [];

        // എല്ലാ മെമ്പേഴ്സിനെയും ലിസ്റ്റ് ചെയ്യുന്നു
        participants.forEach((mem, i) => {
            membersList += ` *${i + 1}.* @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        });

        const tagMsg = `*👺⃝⃘̉̉̉━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆* 
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
┃
┃╭╌❲ *ᴛᴀɢɢɪɴɢ ᴇᴠᴇʀʏᴏɴᴇ* ❳
┃${membersList}
┃╰╌╌╌╌╌╌╌╌╌࿐
┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━⛥❖⛥━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // 1. ഇമേജ് സഹിതം ടാഗ് മെസ്സേജ് അയക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: { url: imagePath }, 
                caption: tagMsg, 
                mentions: mentions 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { 
                text: tagMsg, 
                mentions: mentions 
            }, { quoted: msg });
        }

        // 2. വോയിസ് നോട്ട് (song.opus) അയക്കുന്നു
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (err) {
        console.error("TagAll Error:", err);
        await sock.sendMessage(chat, { text: "Error ❌" });
    }
};

