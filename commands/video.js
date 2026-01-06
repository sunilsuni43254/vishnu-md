import yts from "yt-search";
import ytdl from "ytdl-core";
import fs from "fs";
import path from "path";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
    }

    // നിങ്ങളുടെ പഴയ അതേ ഡിസൈൻ
    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *AGO:* ${video.ago}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText });

    const fileName = `./media/video_${Date.now()}.mp4`;

    // വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു (ytdl-core ഉപയോഗിച്ച്)
    const stream = ytdl(video.url, {
      quality: 'highestvideo',
      filter: format => format.container === 'mp4' && format.hasAudio && format.hasVideo
    }).pipe(fs.createWriteStream(fileName));

    stream.on('finish', async () => {
      await sock.sendMessage(chat, {
        video: fs.readFileSync(fileName),
        mimetype: 'video/mp4',
        caption: `*${video.title}*`
      }, { quoted: msg });

      // അയച്ചതിന് ശേഷം ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
      if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
    });

    stream.on('error', (err) => {
      console.error("YTDL Error:", err);
      sock.sendMessage(chat, { text: "ഡൗൺലോഡ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു! ❌" });
    });

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};
