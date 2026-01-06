
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const isGroup = chat.endsWith('@g.us');
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    if (!isGroup) {
        return sock.sendMessage(chat, { text: "❌ This command can only be used in groups!" });
    }

    try {
        // ഗ്രൂപ്പ് ഡാറ്റ കൃത്യമായി വരാൻ അല്പം കാത്തിരിക്കുന്നു
        const metadata = await sock.groupMetadata(chat);
        const participants = metadata.participants;
        
        let membersList = "";
        let mentions = [];

        // മെമ്പേഴ്സിനെ ടാഗ് ലിസ്റ്റിലേക്ക് മാറ്റുന്നു
        participants.forEach((mem, i) => {
            membersList += `┃ *${i + 1}.* @${mem.id.split('@')[0]}\n`;
            mentions.push(mem.id);
        });

        // നിങ്ങൾ നൽകിയ അതേ ഡിസൈൻ
        const tagMsg = `*👺⃝⃘̉̉━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
 *⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
┃
┃
╭╌❲ *ᴛᴀɢɢɪɴɢ ᴇᴠᴇʀʏᴏɴᴇ* ❳
┃ ${membersList}
╰╌╌╌╌╌╌╌╌╌࿐
┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━⛥❖⛥━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        // 1. ഫോട്ടോയും ടാഗും അയക്കുന്നു
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

        // 2. വോയിസ് നോട്ട് അയക്കുന്നു
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mp4', // Render-ൽ പൊരുത്തപ്പെടാൻ mp4 mimetype സഹായിക്കും
                ptt: true 
            }, { quoted: msg });
        }

    } catch (err) {
        console.error("TagAll Error:", err);
        // എറർ ഉണ്ടെങ്കിൽ അത് മെസ്സേജ് ആയി അയക്കാം
        await sock.sendMessage(chat, { text: "⚠️ Error fetching group members. Try again." });
    }
};
