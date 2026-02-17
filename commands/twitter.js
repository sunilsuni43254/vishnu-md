import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const url = args[0];

    if (!url) return sock.sendMessage(chat, { text: "❌Example: .Twitter link" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // Scraping 
        const config = {
            method: 'post',
            url: 'https://api.savetwitter.net/api/ajaxSearch',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36'
            },
            data: `q=${encodeURIComponent(url)}&lang=en`
        };

        const response = await axios(config);
        const data = response.data;

        if (data.status !== 'ok') throw new Error("Invalid Link");

        // finding html links
        const html = data.data;
        const dlLink = html.match(/href="(https:\/\/dl\.savetwitter\.net\/[^"]+)"/)?[1] 
                     || html.match(/href="([^"]+)"/)?[1];
        const title = html.match(/<div class="content">([\s\S]*?)<\/div>/)?[1]?.trim() || "Twitter Media";

        if (!dlLink) throw new Error("Download Link Not Found");

        // buffer 
        const mediaRes = await axios.get(dlLink, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaRes.data, 'utf-8');

        // Design 
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Twitter Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title.split('\n')[0].substring(0, 20)}...
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *SOURCE:* Twitter/X
╰━━━━━━━━━━━━━━┈⊷
 ⊙👀 *TYPE:* Video/Photo
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *STATUS:* Success ✅
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // വീഡിയോ ആണോ ഇമേജ് ആണോ എന്ന് നോക്കി അയക്കുന്നു
        if (dlLink.includes('.mp4') || dlLink.includes('video')) {
            await sock.sendMessage(chat, { video: buffer, caption: caption, mimetype: 'video/mp4' }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { image: buffer, caption: caption }, { quoted: msg });
        }

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error("Twitter Error:", error);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};
