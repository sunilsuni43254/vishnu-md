import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";

export default async (sock, msg, query) => {
  const chat = msg.key.remoteJid;
  
  // query ലഭിച്ചില്ലെങ്കിൽ
  if (!query || query.length === 0) {
    return sock.sendMessage(chat, { text: "Usage: .song [song name]" });
  }

  // തിരയുന്നു
  const search = await yts(query);
  const video = search.videos[0];
  if (!video) return sock.sendMessage(chat, { text: "Song Not Found 😢" });

  const infoText = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━━━❥❥❥ 
┃ *Owner:* arun•°Cumar 
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

  // ഇൻഫോ അയക്കുന്നു
  await sock.sendMessage(chat, { 
    image: { url: video.thumbnail }, 
    caption: infoText 
  });

  // ഡൗൺലോഡ് പ്രോസസ്സ്
  const fileName = `audio_${Date.now()}.mp3`;
  exec(`yt-dlp -x --audio-format mp3 "${video.url}" -o ${fileName}`, async (error) => {
    if (error) {
      console.error(error);
      return sock.sendMessage(chat, { text: "Error downloading audio! Make sure yt-dlp is installed." });
    }

    const mp3 = fs.readFileSync(fileName);
    await sock.sendMessage(chat, { 
      audio: mp3, 
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`
    });

    // ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു
    fs.unlinkSync(fileName);
  });
};
