import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";
import axios from "axios";

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
    // 1. യൂട്യൂബിൽ തിരയുന്നു
    const search = await yts(searchQuery);
    const video = search.videos[0];
    if (!video) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙👀 *VIEWS:* ${video.views}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ 1️⃣ Audio 🔊
╔━━━━━━━━━━━
┃ 2️⃣ Voice 🎤
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 2. തംബ്‌നെയിൽ മെസ്സേജ് അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    const fileName = `./media/audio_${Date.now()}.mp3`;
    const voiceFileName = `./media/voice_${Date.now()}.opus`;

    // 3. ഡൗൺലോഡ് പ്രോസസ്സ്
    try {
      // Render-ൽ python3 -m yt_dlp ഉപയോഗിക്കുന്നത് എറർ ഒഴിവാക്കാൻ സഹായിക്കും
      await execPromise(`python3 -m yt_dlp -x --audio-format mp3 --audio-quality 0 "${video.url}" -o "${fileName}"`);

      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 100) {
          if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
          return sock.sendMessage(chat, { text: "❌ File is too large (Over 100MB)!" });
        }

        const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
        const thumbBuffer = Buffer.from(thumbRes.data);

        // FFmpeg ഉപയോഗിച്ച് വോയിസ് നോട്ടിലേക്ക് മാറ്റുന്നു
        await execPromise(`ffmpeg -i "${fileName}" -c:a libopus -ar 16000 -ac 1 "${voiceFileName}"`);

        // ✅ 1. ഓഡിയോ ഫയൽ അയക്കുന്നു
        await sock.sendMessage(chat, {
          audio: fs.readFileSync(fileName),
          mimetype: "audio/mpeg",
          fileName: `${video.title}.mp3`,
          contextInfo: {
            externalAdReply: {
              title: video.title,
              body: 'Asura MD 👺',
              thumbnail: thumbBuffer,
              thumbnailUrl: video.thumbnail,
              mediaType: 1,
              sourceUrl: video.url,
              renderLargerThumbnail: true,
            }
          }
        }, { quoted: msg });

        // ✅ 2. വോയിസ് നോട്ട് അയക്കുന്നു (PTT)
        if (fs.existsSync(voiceFileName)) {
          await sock.sendMessage(chat, {
            audio: fs.readFileSync(voiceFileName),
            mimetype: "audio/ogg; codecs=opus",
            ptt: true,
            contextInfo: {
              externalAdReply: {
                title: video.title,
                body: 'Asura MD 👺',
                thumbnail: thumbBuffer,
                thumbnailUrl: video.thumbnail,
                mediaType: 1,
                sourceUrl: video.url,
                renderLargerThumbnail: true,
              }
            }
          }, { quoted: msg });
          fs.unlinkSync(voiceFileName);
        }

        fs.unlinkSync(fileName);
      }
    } catch (execError) {
      console.error("Execution Error:", execError);
      return sock.sendMessage(chat, { text: "❌ Error during processing! Make sure yt-dlp and ffmpeg are installed." });
    }
  } catch (e) {
    console.error("Main Error:", e);
    await sock.sendMessage(chat, { text: "❌ Something went wrong!" });
  }
};
