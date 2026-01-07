import fs from 'fs';

export default async (sock, msg, args) => {
const chat = msg.key.remoteJid;
        try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
const imagePath = './media/thumb.jpg'; 
const songPath = './media/song.opus'; 

    const menuText = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙  .Ping*
┃ *⊙  .Alive*
┃ *⊙  .Menu*
┃ *⊙  .Song   <name>*
┃ *⊙  .Video  <name>*
┃ *⊙  .Sticker*
┃ *⊙  .Game*
┃ *⊙  .Fun*
┃ *⊙  .Font <text>*
┃ *⊙  .Owner*
┃ *⊙  .Play <name>*
┃ *⊙  .Tagall*
┃ *⊙  .Image <name>* 
┃ °☆°☆°☆°☆°☆°☆°☆°☆°☆°☆°
╠━━━━━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD* > 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    try {
        // 1. Send Image with Menu Text
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, {
                image: fs.readFileSync(imagePath),
                caption: menuText
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: menuText }, { quoted: msg });
        }

        // 2. Send Opus Audio (As Voice Note with Context Info)
        if (fs.existsSync(songPath)) {
            const audioBuffer = fs.readFileSync(songPath);

            await sock.sendMessage(chat, {
                audio: { url: songPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                contextInfo: {
                    externalAdReply: {
                        title: 'Asura MD 👺',
                        body: 'Playing Menu Theme...',
                        thumbnail: fs.existsSync(imagePath) ? fs.readFileSync(imagePath) : null,
                        mediaType: 1,
                        sourceUrl: 'https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24'
                    }
                }
            }, { quoted: msg });
        } else {
            console.log("Menu audio file not found!");
        }
        
    } catch (error) {
        console.error("Error in menu command:", error);
    }
};
