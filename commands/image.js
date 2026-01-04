import axios from 'axios';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imageName = args.join(" ");
    const thumbPath = './media/thumb.jpg';

    if (!imageName) {
        const helpMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙ ɪᴍᴀɢᴇ sᴇᴀʀᴄʜᴇʀ*
┃ *⊙ ᴜsᴀɢᴇ: .image <query>*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        if (fs.existsSync(thumbPath)) {
            return sock.sendMessage(chat, { image: fs.readFileSync(thumbPath), caption: helpMsg });
        } else {
            return sock.sendMessage(chat, { text: helpMsg });
        }
    }

    try {
        await sock.sendMessage(chat, { text: `Searching for *${imageName}*... 🔍` });

        // Using a public API for image searching
        const apiUrl = `https://api.vreden.my.id/api/bingimg?query=${encodeURIComponent(imageName)}`;
        const response = await axios.get(apiUrl);
        
        // API response structure അനുസരിച്ച് image URL എടുക്കുന്നു
        if (response.data.status === 200 && response.data.result.length > 0) {
            const results = response.data.result;
            const randomImg = results[Math.floor(Math.random() * results.length)];
            
            await sock.sendMessage(chat, { 
                image: { url: randomImg }, 
                caption: `*Result for:* ${imageName}\n*Bot:* Asura MD 👺` 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: "❌ No images found for this name." });
        }
    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ Error fetching image. Please try again later." });
    }
};
