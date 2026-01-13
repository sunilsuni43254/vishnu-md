import axios from 'axios';
import yts from 'yt-search';

export default async (sock, msg, args) => {
    const chatId = msg.key.remoteJid;
    const searchQuery = args.join(" ");

    if (!searchQuery) {
        return sock.sendMessage(chatId, { text: '❌ Which song do you want to play?' }, { quoted: msg });
    }

    try {
        // 1. YouTube Search
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
            return sock.sendMessage(chatId, { text: '❌ Song not found!' }, { quoted: msg });
        }

        const video = videos[0];
        const videoUrl = video.url;

        // 2. Fetch Direct Audio Stream URL (No Local Download)
        // ytmp3 എൻഡ് പോയിന്റ് ഉപയോഗിച്ച് നേരിട്ട് ഓഡിയോ ലിങ്ക് എടുക്കുന്നു
        const dlRes = await axios.get(`https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        
        if (!dlRes.data || !dlRes.data.data || !dlRes.data.data.dl) {
            throw new Error('Audio source not available');
        }

        const finalAudioUrl = dlRes.data.data.dl;

        // 3. Asura MD Design for Music
        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹*    *🎵Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙🎙️ *ARTIST:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        // 4. Send Thumbnail first (Optional, but looks better)
        await sock.sendMessage(chatId, { 
            image: { url: video.thumbnail }, 
            caption: infoText 
        }, { quoted: msg });

        // 5. Send Audio Directly 
        await sock.sendMessage(chatId, {
            audio: { url: finalAudioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            contextInfo: {
                externalAdReply: {
                    title: video.title,
                    body: 'Asura MD Music Player 👺',
                    thumbnailUrl: video.thumbnail,
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: true,
                    sourceUrl: videoUrl
                }
            }
        }, { quoted: msg });

    } catch (error) {
        console.error('[MUSIC ERROR]:', error);
        await sock.sendMessage(chatId, { text: '❌ Connection failed. Please try again later.' }, { quoted: msg });
    }
};
