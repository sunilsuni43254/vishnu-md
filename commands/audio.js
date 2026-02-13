import axios from 'axios';
import ytSearch from 'yt-search';
import { PassThrough } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';

ffmpeg.setFfmpegPath(ffmpegPath);

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/* ---------------- YTMP3 DIRECT ---------------- */

const getAudioUrl = async (url) => {

    const headers = {
        'Referer': 'https://id.ytmp3.mobi/',
        'User-Agent': 'Mozilla/5.0'
    };

    let videoID;
    try {
        const parsed = new URL(url);
        videoID = parsed.hostname === "youtu.be"
            ? parsed.pathname.slice(1)
            : parsed.searchParams.get("v");
    } catch {
        throw new Error("Invalid URL");
    }

    // INIT
    const { data: initData } = await axios.get(
        `https://d.ymcdn.org/api/v1/init?p=y&23=1llum1n471&_=${Date.now()}`,
        { headers }
    );

    if (!initData?.convertURL)
        throw new Error("Init failed");

    const convertUrl = `${initData.convertURL}&v=${videoID}&f=mp3&_=${Date.now()}`;

    const { data: convertData } = await axios.get(convertUrl, { headers });

    if (!convertData?.progressURL)
        throw new Error("Convert failed");

    // POLLING
    let attempts = 0;
    while (attempts < 40) {

        const { data: progress } = await axios.get(convertData.progressURL, { headers });

        if (progress.progress === 3 && progress.downloadURL)
            return progress.downloadURL;

        if (progress.progress === -1)
            throw new Error("Server conversion failed");

        await delay(1500);
        attempts++;
    }

    throw new Error("Timeout: Server slow");
};

/* ---------------- MAIN COMMAND ---------------- */

export default async (sock, msg, args) => {

    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query)
        return sock.sendMessage(chat,
            { text: "❌ .audio name/link" },
            { quoted: msg }
        );

    try {

        await sock.sendMessage(chat, {
            react: { text: "⏳", key: msg.key }
        });

        /* --------- SEARCH --------- */

        const search = await ytSearch(query);
        const video = search.videos[0];
        if (!video) throw new Error("Not Found");

        const infoText = `
*👺⃝⃘̉̉━━━━━━━━◆◆◆*
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
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ *Sending Audio 🔊*
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        /* --------- THUMB --------- */

        await sock.sendMessage(chat, {
            image: { url: video.thumbnail },
            caption: infoText
        }, { quoted: msg });

        /* --------- GET DIRECT AUDIO --------- */

        const rawAudioUrl = await getAudioUrl(video.url);

        const response = await axios.get(rawAudioUrl, {
            responseType: 'arraybuffer',
            headers: {
                'Referer': 'https://id.ytmp3.mobi/'
            }
        });

        const inputBuffer = Buffer.from(response.data);

        /* --------- FFMPEG STREAM CONVERT --------- */

        const convertAudio = () => {
            return new Promise((resolve, reject) => {

                const inputStream = new PassThrough();
                inputStream.end(inputBuffer);

                const chunks = [];

                ffmpeg(inputStream)
                    .audioBitrate(128)
                    .format('mp3')
                    .on('error', err => reject(err))
                    .on('end', () => resolve(Buffer.concat(chunks)))
                    .pipe()
                    .on('data', chunk => chunks.push(chunk));
            });
        };

        const finalBuffer = await convertAudio();

        if (!finalBuffer || finalBuffer.length === 0)
            throw new Error("FFmpeg conversion failed");

        /* --------- SEND AUDIO --------- */

        await sock.sendMessage(chat, {
            audio: finalBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: false
        }, { quoted: msg });

        await sock.sendMessage(chat, {
            react: { text: "✅", key: msg.key }
        });

    } catch (e) {

        console.error("Audio Play Error:", e);

        await sock.sendMessage(chat,
            { text: "❌ error: " + e.message },
            { quoted: msg }
        );
    }
};
