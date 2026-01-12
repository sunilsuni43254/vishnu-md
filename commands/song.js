import { Client } from "soundcloud-scraper";
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";
import axios from "axios";

const scClient = new Client();

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchQuery = args.join(" ");

  if (!searchQuery) {
    return sock.sendMessage(chat, { text: "❌ Usage: *.song* [song name]" });
  }

  try {
    // 1. SoundCloud സെർച്ച്
    const searchResults = await scClient.search(searchQuery, "track");
    if (!searchResults.length) return sock.sendMessage(chat, { text: "❌ Song Not Found!" });

    const track = searchResults[0];
    const songInfo = await scClient.getSongInfo(track.url);

    // നിങ്ങളുടെ പഴയ അതേ ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Song Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${songInfo.title}
 ⊙📺 *ARTIST:* ${songInfo.author.name}
 ⊙⏳ *DURATION:* ${Math.floor(songInfo.duration / 60000)} mins
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Audio 🔊*
╔━━━━━━━━━━━
┃ *Voice 🎤*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // തംബ്നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, {
      image: { url: songInfo.thumbnail },
      caption: infoText
    });

    // തംബ്നെയിൽ ബഫർ (External Ad Reply-ക്കായി)
    const thumbRes = await axios.get(songInfo.thumbnail, { responseType: 'arraybuffer' });
    const thumbBuffer = Buffer.from(thumbRes.data);

    // 2. നേരിട്ടുള്ള സ്ട്രീമിംഗ് ലിങ്ക്
    const stream = await songInfo.downloadProgressive();

    // ✅ ഓഡിയോ സ്ട്രീം അയക്കുന്നു
    await sock.sendMessage(chat, {
      audio: { stream: stream },
      mimetype: "audio/mpeg",
      fileName: `${songInfo.title}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: songInfo.title,
          body: 'Asura MD 👺 | SoundCloud',
          thumbnail: thumbBuffer,
          mediaType: 1,
          sourceUrl: songInfo.url,
          renderLargerThumbnail: true,
        }
      }
    }, { quoted: msg });

    // ✅ വോയിസ് സ്ട്രീം അയക്കുന്നു
    const voiceStreamSource = await songInfo.downloadProgressive();
    const voiceStream = new PassThrough();
    ffmpeg(voiceStreamSource)
      .toFormat('ogg')
      .audioCodec('libopus')
      .pipe(voiceStream);

    await sock.sendMessage(chat, {
      audio: { stream: voiceStream },
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: msg });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(chat, { text: "❌ All servers are busy. Please try again later!" });
  }
};
