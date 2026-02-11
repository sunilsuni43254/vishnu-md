import axios from 'axios';
import ytSearch from 'yt-search';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const getAudioUrl = async (url) => {
    const headers = { 'Referer': 'https://id.ytmp3.mobi/' };
    const videoID = url.includes('youtu.be') ? url.split('/').pop() : new URL(url).searchParams.get('v');
    const { data: initData } = await axios.get(`https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Math.random()}`, { headers });
    const urlParam = { v: videoID, f: 'mp3', _: Math.random() };
    const { data: convertData } = await axios.get(`${initData.convertURL}&${new URLSearchParams(urlParam)}`, { headers });
    return convertData.downloadURL;
};

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "❌ .audio name or link!" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🎧", key: msg.key } });

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Video not found");

        const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Audio Download*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Streaming...* ❳•°•
 ⊙🎬 *TITLE:* ${video.title}
╰━━━━━━━━━━━━━━┈⊷
 ⊙📺 *CHANNEL:* ${video.author.name}
╰━━━━━━━━━━━━━━┈⊷
 ⊙⏳ *DURATION:* ${video.timestamp}
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        const rawAudioUrl = await getAudioUrl(video.url);
        
        // താൽക്കാലിക ഫയലുകൾ ഉണ്ടാക്കുന്നു
        const tempFile = `./${Date.now()}.mp3`;
        const tempPtt = `./${Date.now()}.opus`;

        // 1. MP3 temporary download 
        const response = await axios.get(rawAudioUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(tempFile, Buffer.from(response.data));

        // 2. audio file
        await sock.sendMessage(chat, {
            audio: fs.readFileSync(tempFile),
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: msg });

        // 3. PTT (Voice Note) 
        exec(`ffmpeg -i ${tempFile} -acodec libopus -b:a 128k -vbr on -compression_level 10 ${tempPtt}`, async (err) => {
            if (err) {
                console.error('FFmpeg Error:', err);
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
                return;
            }

            if (fs.existsSync(tempPtt)) {
                await sock.sendMessage(chat, {
                    audio: fs.readFileSync(tempPtt),
                    mimetype: 'audio/ogg; codecs=opus',
                    ptt: true 
                }, { quoted: msg });

                fs.unlinkSync(tempFile);
                fs.unlinkSync(tempPtt);
                await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });
            }
        });

    } catch (e) {
        console.error("Audio Play Error:", e);
        await sock.sendMessage(chat, { text: "❌ Error: Unable to process audio." }, { quoted: msg });
    }
};
