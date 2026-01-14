import yts from "yt-search";
import axios from "axios";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .audio < name>" });
  }

  try {
    // 1. യൂട്യൂബ് സെർച്ച്
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Audio Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;
    const channel = video.author.name;
    const views = video.views;
    const date = video.ago;

    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Aduio Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎵 *TITLE:* ${title}
 ⊙📺 *CHANNEL:* ${channel}
 ⊙👀 *VIEWS:* ${views}
 ⊙⏳ *AGO:* ${date}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    //  (Local image path: ./media/thumb.jpg)
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };
    
    await sock.sendMessage(chat, { 
      image: imageContent, 
      caption: `*Downloading:* ${title}` 
    });

    // 2. API-ൽ നിന്ന് ലിങ്ക് എടുക്കുന്നു
    let downloadUrl = null;
    try {
      const resYupra = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
      if (resYupra.data?.success) {
        downloadUrl = resYupra.data.data.download_url;
      } else {
        const resOkatsu = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
        downloadUrl = resOkatsu.data?.dl;
      }
    } catch (e) { console.error("API Link Fetching Failed"); }

    if (!downloadUrl) return sock.sendMessage(chat, { text: " loading" });

  
    const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
    const audioBuffer = Buffer.from(response.data, 'binary');

    // 4. ഓഡിയോ അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false 
    }, { quoted: msg });

  } catch (err) {
    console.error("Streaming Error:", err);
    sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
