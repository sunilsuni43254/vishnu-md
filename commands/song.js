import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";
import { promisify } from "util";
import axios from "axios";
import ffmpegPath from 'ffmpeg-static';

const execPromise = promisify(exec);

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name/link]" });
  }

  try {
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

    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    if (!fs.existsSync('./media')) fs.mkdirSync('./media');

    const fileName = `./media/audio_${Date.now()}.mp3`;
    const voiceFileName = `./media/voice_${Date.now()}.opus`;

    try {
      // ✅ കുക്കീസ് ഇല്ലാതെ Render-ൽ വർക്ക് ആകാൻ --user-agent ചേർത്തു
      // --no-check-certificates സർട്ടിഫിക്കറ്റ് എറർ ഒഴിവാക്കും
      const ytDlpCommand = `python3 -m yt_dlp --no-check-certificates --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36" -x --audio-format mp3 --audio-quality 0 "${video.url}" -o "${fileName}"`;
      
      await execPromise(ytDlpCommand);

      if (fs.existsSync(fileName)) {
        const stats = fs.statSync(fileName);
        const fileSizeMB = stats.size / (1024 * 1024);

        if (fileSizeMB > 100) {
          if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
          return sock.sendMessage(chat, { text: "❌ File is too large (Over 100MB)!" });
        }

        const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
        const thumbBuffer = Buffer.from(thumbRes.data);

        await execPromise(`${ffmpegPath} -i "${fileName}" -c:a libopus -ar 16000 -ac 1 "${voiceFileName}"`);

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
      } else {
         throw new Error("Not Found");
      }
    } catch (execError) {
      console.error("Execution Error:", execError);
      return sock.sendMessage(chat, { text: `❌ Processing Error: ${execError.message}\n\n*Tip:* error ` });
    }
  } catch (e) {
    console.error("Main Error:", e);
    await sock.sendMessage(chat, { text: "❌ Something went wrong!" });
  }
};
