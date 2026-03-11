import { xnxxSearch, xnxxDownload } from 'xnxx-render';
import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(" ");

    if (!query) return sock.sendMessage(from, { text: ".xnxx hot videos*" });

    try {
        
        const res = await xnxxSearch(query);
        if (!res.length) return sock.sendMessage(from, { text: "❌ error." });

        const videoData = res[0]; 
        const details = await xnxxDownload(videoData.link);

        await sock.sendMessage(from, { 
            image: { url: videoData.thumb }, 
            caption: `🔥 *Title:* ${videoData.title}\n⏱️ *Duration:* ${videoData.duration}\n\n*please wait try again later...*` 
        }, { quoted: msg });

        await sock.sendMessage(from, {
            video: { url: details.high || details.low }, 
            caption: `✅ *${videoData.title}* Complete!`,
            mimetype: 'video/mp4',
            fileName: `${videoData.title}.mp4`
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        sock.sendMessage(from, { text: "❌ error." });
    }
};
