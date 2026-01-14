import yts from "yt-search";
import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

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

    const videoUrl = video.url;

    // Design Caption
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
 ⊙📺 *CHANNEL:* ${video.author.name}
 ⊙⏳ *DURATION:* ${video.timestamp}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
┃ *Sending Voice 🎤*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // Send Thumbnail
    await sock.sendMessage(chat, {
      image: { url: video.thumbnail },
      caption: infoText
    });

    const thumbRes = await axios.get(video.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    let finalAudioUrl = null;
    const audioApis = [
        async () => { 
            const res = await axios.get(`https://api.yupra.my.id/api/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
            return res.data.data.download_url;
        },
        async () => { 
            const res = await axios.get(`https://okatsu-rolezapiiz.vercel.app/downloader/ytmp3?url=${encodeURIComponent(videoUrl)}`);
            return res.data.dl;
        }
    ];

    for (const getAUrl of audioApis) {
        try {
            finalAudioUrl = await getAUrl();
            if (finalAudioUrl) break;
        } catch (e) { console.log("API Layer Failed..."); }
    }

    if (!finalAudioUrl) throw new Error("All Audio APIs failed");

    // Function to convert stream to buffer for stable sending
    const getBuffer = (stream) => {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on('data', (chunk) => chunks.push(chunk));
            stream.on('end', () => resolve(Buffer.concat(chunks)));
            stream.on('error', reject);
        });
    };

    // 1. ✅ Audio (MP3 format conversion via FFmpeg stream)
    const audioStream = new PassThrough();
    ffmpeg(finalAudioUrl)
        .toFormat('mp3')
        .audioBitrate(128)
        .on('error', (err) => console.log('FFmpeg Audio Error:', err.message))
        .pipe(audioStream);

    const audioBuffer = await getBuffer(audioStream);

    await sock.sendMessage(chat, {
      audio: audioBuffer,
      mimetype: "audio/mpeg",
      fileName: `${video.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });
    //  ✅ Voice Note (PTT) 
    const voiceStream = new PassThrough();
    ffmpeg(finalAudioUrl)
      .vn() 
      .audioCodec('libopus')
      .audioChannels(1)
      .audioFrequency(48000)
      .toFormat('opus') 
      .on('error', (err) => console.log('FFmpeg Voice Error:', err.message))
      .pipe(voiceStream);

    const voiceBuffer = await getBuffer(voiceStream);

    await sock.sendMessage(chat, {
      audio: voiceBuffer,
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: 'Asura MD 👺',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: videoUrl,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
