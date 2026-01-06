import yts from "yt-search";
import axios from "axios";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";
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

    // നിങ്ങൾ തന്ന അതേ ഡിസൈൻ
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

    // ✅ API വഴി ഡൗൺലോഡ് ലിങ്ക് എടുക്കുന്നു (Cookies ആവശ്യമില്ല)
    const apiRes = await axios.get(`https://api.vkrhost.workers.dev/server?url=${video.url}`);
    const downloadUrl = apiRes.data.data.find(f => f.format === "mp3" || f.ext === "mp3")?.url || apiRes.data.data[0].url;

    if (!downloadUrl) throw new Error("Could not fetch download link");

    // ഫയൽ താൽക്കാലികമായി ഡൗൺലോഡ് ചെയ്യുന്നു
    const writer = fs.createWriteStream(fileName);
    const response = await axios({
      url: downloadUrl,
      method: 'GET',
      responseType: 'stream'
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    // തംബ്‌നെയിൽ ബഫർ ഉണ്ടാക്കുന്നു
    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // ✅ 1. ഓഡിയോ ഫയൽ അയക്കുന്നു (ExternalAdReply സഹിതം)
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

    // ✅ 2. വോയിസ് നോട്ട് ഉണ്ടാക്കി അയക്കുന്നു
    await execPromise(`${ffmpegPath} -i "${fileName}" -c:a libopus -ar 16000 -ac 1 "${voiceFileName}"`);
    
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

  } catch (e) {
    console.error(e);
    await sock.sendMessage(chat, { text: "❌ Error: " + e.message });
  }
};
