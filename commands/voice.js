import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: "എന്തെങ്കിലും ടൈപ്പ് ചെയ്യൂ..." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് ഫീൽ നൽകാൻ ചെറിയ തിരുത്തലുകൾ ---
        // വാക്കുകൾക്കിടയിൽ കോമയിട്ടാൽ ഗൂഗിൾ ശ്വാസം വിടുന്നത് പോലെ ഇടവേളയെടുക്കും (Medium Speed Feel)
        let processedText = text.replace(/\s+/g, ', '); 

        // --- ലാംഗ്വേജ് ഓട്ടോമാറ്റിക് ആയി തിരിച്ചറിയുന്നു ---
        let lang = 'en';
        if (/[\u0D00-\u0D7F]/.test(text)) lang = 'ml';      // Malayalam
        else if (/[\u0B80-\u0BFF]/.test(text)) lang = 'ta'; // Tamil
        else if (/[\u0900-\u097F]/.test(text)) lang = 'hi'; // Hindi
        else if (/[\u0600-\u06FF]/.test(text)) lang = 'ar'; // Arabic
        else if (/[a-zA-Z]/.test(text)) lang = 'en';       // English

        // --- Audio URL നിർമ്മിക്കുന്നു (No Download) ---
        // ഇതിൽ slow: false നൽകുന്നത് നോർമൽ ഹ്യൂമൻ സ്പീഡ് ലഭിക്കാനാണ്
        const url = googleTTS.getAudioUrl(processedText.slice(0, 200), {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // --- നേരിട്ട് URL സ്ട്രീം ചെയ്യുന്നു ---
        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/mp4', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: `ASURA AI VOICE - ${lang.toUpperCase()}`,
                    body: "Automatically detected your language",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    showAdAttribution: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("TTS Error:", e);
        await sock.sendMessage(chat, { text: "Error: വോയ്‌സ് ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല!" });
    }
};
