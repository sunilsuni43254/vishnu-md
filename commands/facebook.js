import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(" ");

    if (!query) return sock.sendMessage(chat, { text: "⚠️ Example: .facebook name/link" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🔍", key: msg.key } });

        let videoUrl = "";
        let title = "Facebook Media";

        // 1.searching
        if (!query.includes("facebook.com") && !query.includes("fb.watch")) {
            
            const searchRes = await axios.get(`https://www.google.com/search?q=site:facebook.com+video+${encodeURIComponent(query)}`);
            const linkMatch = searchRes.data.match(/https:\/\/www\.facebook\.com\/watch\/\?v=\d+/);
            
            if (linkMatch) {
                videoUrl = linkMatch[0];
            } else {
                return sock.sendMessage(chat, { text: "❌ notfound." }, { quoted: msg });
            }
        } else {
            videoUrl = query;
        }

        // 2. ഡൗൺലോഡ് ലോജിക് (FDownloader Scraper - No API)
        const scrapRes = await axios.post('https://fdownloader.net/api/ajaxSearch', 
            new URLSearchParams({ 'q': videoUrl, 'vt': 'facebook' }), 
            { headers: { 'User-Agent': 'Mozilla/5.0' } }
        );

        const dlMatch = scrapRes.data.data.match(/href=\\"(https:\/\/.*?\.mp4.*?)\\"/);
        if (!dlMatch) throw new Error("Link Expired or Private");

        const finalDlUrl = dlMatch[1].replace(/\\/g, '');
        const mediaRes = await axios.get(finalDlUrl, { responseType: 'arraybuffer' });
        const buffer = Buffer.from(mediaRes.data);

        // 3. ഡിസൈൻ
        const date = new Date().toLocaleDateString();
        const caption = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *FB Search & Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Processing...* ❳•°•
 ⊙🎬 *TITLE:* ${query.substring(0, 20)}...
 ⊙📺 *SOURCE:* Facebook
 ⊙⏳ *DATE:* ${date}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇഡി ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, {
            video: buffer,
            caption: caption,
            mimetype: 'video/mp4'
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (error) {
        console.error(error);
        await sock.sendMessage(chat, { text: "❌ error." }, { quoted: msg });
    }
};
