import axios from 'axios';
import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');
    const thumbPath = './media/thumb.jpg';

    if (!text) return sock.sendMessage(chat, { text: "എന്തെങ്കിലും ചോദിക്കൂ... (Example: .voice How are you?)" }, { quoted: msg });

    try {
        // 1. AI മറുപടി എടുക്കുന്നു
        const response = await axios.get(`https://api.simsimi.net/v2/?text=${encodeURIComponent(text)}&lc=ml`);
        const aiReply = response.data.success || "Sorry, I couldn't understand that.";

        // 2. AI മറുപടി ഏത് ഭാഷയാണെന്ന് തിരിച്ചറിയുന്നു (Language Detection)
        let lang = 'en'; 
        if (/[\u0D00-\u0D7F]/.test(aiReply)) lang = 'ml';
        else if (/[\u0B80-\u0BFF]/.test(aiReply)) lang = 'ta';
        else if (/[\u0900-\u097F]/.test(aiReply)) lang = 'hi';
        else if (/[a-zA-Z]/.test(aiReply)) lang = 'en';

        // 3. AI മറുപടിയെ വോയ്‌സ് ആക്കുന്നു (Direct Stream - No Download)
        // google-tts-api ഉപയോഗിച്ച് ലിങ്ക് മാത്രം നിർമ്മിക്കുന്നു
        const audioUrl = googleTTS.getAudioUrl(aiReply.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // 4. വോയ്‌സ് നോട്ടായി മറുപടി അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: { url: audioUrl }, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI (${lang.toUpperCase()})`,
                    body: aiReply, 
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("AI Error:", e);
        await sock.sendMessage(chat, { text: "AI Error!" });
    }
};
