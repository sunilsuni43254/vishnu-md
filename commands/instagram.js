import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, { text: "❌ Example: `.Instagram [Instagram-Link]`" }, { quoted: msg });
    }

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        if (!query.includes('instagram.com')) {
             return sock.sendMessage(chat, { text: "⚠️ Please provide a valid Instagram link!" }, { quoted: msg });
        }

        const params = new URLSearchParams();
        params.append('url', query);
        params.append('lang', 'en');

        // Scraping from saveclip.app
        const response = await axios.post('https://saveclip.app/api/ajaxSearch', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const htmlData = response.data.data; 
        if (!htmlData) throw new Error("Invalid Response");

        // link finding 
        const dlMatch = htmlData.match(/href=\\"(https:\/\/.*?)\\"/);
        const thumbMatch = htmlData.match(/src=\\"(https:\/\/.*?)\\"/);

        if (!dlMatch) throw new Error("Private or Broken link");

        const dlUrl = dlMatch[1].replace(/\\/g, '');
        const thumb = thumbMatch ? thumbMatch[1].replace(/\\/g, '') : '';

        const mediaRes = await axios.get(dlUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaRes.data);
        
        // video checking
        const isVideo = dlUrl.includes('.mp4') || dlUrl.includes('video');

        // Design 
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Instagram Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${query.substring(0, 15)}...
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Instagram
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* ${isVideo ? 'Video' : 'Image'}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success ✅
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

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
