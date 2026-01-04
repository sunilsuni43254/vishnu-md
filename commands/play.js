import yts from 'yt-search';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");
    const thumbPath = './media/thumb.jpg';

    if (!text) {
        const helpMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙ ᴘʟᴀʏ ᴍᴜsɪᴄ*
┃ *⊙ ᴜsᴀɢᴇ: .play <song name>*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        if (fs.existsSync(thumbPath)) {
            return sock.sendMessage(chat, { image: fs.readFileSync(thumbPath), caption: helpMsg });
        } else {
            return sock.sendMessage(chat, { text: helpMsg });
        }
    }

    try {
        await sock.sendMessage(chat, { text: `🔎 Searching for *${text}*...` });

        // Search YouTube
        const search = await yts(text);
        const video = search.videos[0];

        if (!video) return sock.sendMessage(chat, { text: "❌ No results found!" });

        const playMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙ Title:* ${video.title}
┃ *⊙ Duration:* ${video.timestamp}
┃ *⊙ Views:* ${video.views}
┃ *⊙ Uploaded:* ${video.ago}
╠━━━━━━━━━━━━━❥❥❥
┃ *📥 Downloading audio...*
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥`;

        // Sending Video Thumbnail and Details
        await sock.sendMessage(chat, { 
            image: { url: video.thumbnail }, 
            caption: playMsg 
        }, { quoted: msg });

        // ഇവിടെ ഡൗൺലോഡ് ലോജിക് ചേർക്കാം (yt-dlp അല്ലെങ്കിൽ API ഉപയോഗിച്ച്)
        // തൽക്കാലം ലിങ്ക് അയക്കാൻ താഴെ നൽകുന്നു
        await sock.sendMessage(chat, { 
            text: `🎵 *Link:* ${video.url}\n\n> Use .song <link> to download audio.` 
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        sock.sendMessage(chat, { text: "❌ Something went wrong!" });
    }
};

