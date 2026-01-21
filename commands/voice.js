import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".voice Please provide some text!" }, { quoted: msg });

    try {
        // 200 അക്ഷരത്തിൽ കൂടുതൽ ഉണ്ടെങ്കിൽ ആദ്യ ഭാഗം മാത്രം എടുക്കുന്നു (For Stability)
        const safeText = text.length > 200 ? text.substring(0, 200) : text;

        const url = googleTTS.getAudioUrl(safeText, {
            lang: 'en',
            slow: false,
            host: 'https://translate.google.com',
        });

        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg; codecs=opus', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD AI VOICE",
                    body: "😍",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("TTS Error:", e);
        
        await sock.sendMessage(chat, { text: "Error: Voice processing failed!" });
    }
};
