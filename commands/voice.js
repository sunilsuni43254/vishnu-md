import { MsEdgeTTS } from "ms-edge-tts";
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg';

    if (args.length < 2) {
        return sock.sendMessage(chat, { text: "*ഉപയോഗിക്കേണ്ട രീതി:*\n.voice [male/female] [വാചകം]\n\n*Example:* .voice male സുഖമാണോ?" }, { quoted: msg });
    }

    const type = args[0].toLowerCase();
    const text = args.slice(1).join(' ');

    try {
        const tts = new MsEdgeTTS();
        let voice = '';

        // --- ഭാഷ തിരിച്ചറിയുന്നു ---
        const isMalayalam = /[\u0D00-\u0D7F]/.test(text);

        // --- വോയ്‌സ് സെലക്ഷൻ (Male/Female) ---
        if (isMalayalam) {
            voice = (type === 'male') ? 'ml-IN-MidhunNeural' : 'ml-IN-SobhanaNeural';
        } else {
            voice = (type === 'male') ? 'en-US-AndrewNeural' : 'en-US-EmmaNeural';
        }

        // വോയ്‌സ് നിർമ്മിക്കുന്നു (No Download)
        const audioData = await tts.getAudioBuffer(text, voice);

        await sock.sendMessage(chat, { 
            audio: audioData, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI ${type.toUpperCase()} VOICE`,
                    body: text,
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "Error!" });
    }
};
