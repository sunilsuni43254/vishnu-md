import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, { text: "❌ Example: .Instagram <link> OR .Instagram <search name>" }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        let url = query;

        // 1. SEARCH LOGIC
        if (!query.includes('instagram.com')) {
            const searchRes = await axios.get(`https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(query)}`);
            const match = searchRes.data.match(/https:\/\/www\.instagram\.com\/(?:p|reels|reel)\/[a-zA-Z0-9_-]+/);
            
            if (!match) return sock.sendMessage(chat, { text: "❌ No results found on Instagram for this search!" }, { quoted: msg });
            url = match[0];
        }

        // 2. SCRAPING LOGIC (evoig.com)
        const config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            }
        };

        const params = new URLSearchParams();
        params.append('url', url);
        params.append('lang', 'en');

        const { data } = await axios.post('https://saveclip.app/en/api/ajaxSearch', params, config);

        // Finding media link and thumbnail
        const dlUrl = data.data.match(/href="([^"]+)"/)[1];
        const thumbMatch = data.data.match(/src="([^"]+)"/);
        const thumb = thumbMatch ? thumbMatch[1] : 'https://i.imgur.com/your_default.jpg';
        const title = "Asura MD Search Result";

        // Buffer download
        const mediaRes = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaRes.data);

        // Design 
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Instagram Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Instagram
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* Video/Image
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success ✅
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

     //Image
        const isVideo = dlUrl.includes('.mp4') || dlUrl.includes('fbcdn.net');

        if (isVideo) {
            await sock.sendMessage(chat, {
                video: buffer,
                caption: caption,
                mimetype: 'video/mp4',
                contextInfo: {
                    externalAdReply: {
                        title: "ASURA INSTA DOWNLOADER",
                        body: "Reels & Videos Processed",
                        thumbnailUrl: thumb,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, {
                image: buffer,
                caption: caption
            }, { quoted: msg });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ error private account🤣" }, { quoted: msg });
    }
};
