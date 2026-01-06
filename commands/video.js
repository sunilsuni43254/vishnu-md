import yts from "yt-search";
import ytdl from "@distube/ytdl-core"; 

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
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: captionText }, { quoted: msg });

    // വീഡിയോ ഡൗൺലോഡ് ചെയ്യാതെ നേരിട്ട് സ്ട്രീം ചെയ്യുന്നു
    const stream = ytdl(video.url, {
        filter: 'reverbDelay', // Video + Audio രണ്ടും ലഭിക്കാൻ
        quality: 'highestvideo',
    });

    // ബഫർ വഴി വീഡിയോ അയക്കുന്നു
    let chunks = [];
    stream.on('data', (chunk) => {
        chunks.push(chunk);
    });

    stream.on('end', async () => {
        const videoBuffer = Buffer.concat(chunks);
        await sock.sendMessage(chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            caption: `*${video.title}*`
        }, { quoted: msg });
    });

    stream.on('error', (err) => {
        console.error("Stream Error:", err);
        sock.sendMessage(chat, { text: "Error downloading video. ❌" });
    });

  } catch (err) {
    console.error("Main Error:", err);
    await sock.sendMessage(chat, { text: "Something went wrong! 😢" });
  }
};

