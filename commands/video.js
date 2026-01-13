import axios from 'axios';
import yts from 'yt-search';

export default async (sock, msg, args) => {
    const chatId = msg.key.remoteJid;
    const searchQuery = args.join(" ");
    const thumbPath = "./media/thumb.jpg";

    if (!searchQuery) {
        return sock.sendMessage(chatId, { text: '❌ What video do you want to download?' }, { quoted: msg });
    }

    try {
        // 1. YouTube Search
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return sock.sendMessage(chatId, { text: '❌ No videos found!' }, { quoted: msg });
        }

        const video = videos[0];
        const videoUrl = video.url;

        // 2. Fetch Direct Stream URL (No Local Download)
        // Using a reliable public indexer to get mp4 link
        const dlRes = await axios.get(`https://api.siputzx.my.id/api/d/ytmp4?url=${encodeURIComponent(videoUrl)}`);
        
        if (!dlRes.data || !dlRes.data.data || !dlRes.data.data.dl) {
            throw new Error('Video source not available');
        }

        const finalVideoUrl = dlRes.data.data.dl;

        // 3. Your Specific Asura Design
        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🎬 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 4. Send Video Directly (No Local Storage Use)
        await sock.sendMessage(chatId, {
            video: { url: finalVideoUrl },
            caption: infoText,
            mimetype: 'video/mp4',
            fileName: `${video.title}.mp4`
        }, { quoted: msg });

    } catch (error) {
        console.error('[VIDEO ERROR]:', error);
        await sock.sendMessage(chatId, { text: '❌ Download failed. The video might be too large or the server is busy.' }, { quoted: msg });
    }
};
