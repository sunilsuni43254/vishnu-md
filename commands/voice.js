import * as googleTTS from 'google-tts-api';
import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    let text = args.join(' ');
    const thumbPath = './media/thumb.jpg'; 

    if (!text) return sock.sendMessage(chat, { text: ".voice Hello how are you." }, { quoted: msg });

    try {
        // --- ഹ്യൂമൻ വോയ്‌സ് തോന്നിപ്പിക്കാനുള്ള വിദ്യ (Smart Logic) ---
        // 1. ഒന്നിലധികം വാക്കുകൾ ഉണ്ടെങ്കിൽ ഇടയിൽ ചെറിയൊരു വിരാമം വരാൻ സ്പേസിനെ കോമയാക്കുന്നു.
        // 2. ചോദ്യം ചോദിക്കുന്ന വാക്കുകൾ ഉണ്ടെങ്കിൽ അവസാനം ചോദ്യചിഹ്നം ചേർക്കുന്നു.
        
        let processedText = text;
        if (text.length > 10) {
            processedText = text.replace(/\s+/g, ', '); 
        }
        
        // മലയാളം ചോദ്യങ്ങൾ തിരിച്ചറിയാൻ
        if (/(എന്ത്|എവിടെ|എങ്ങനെ|ആര്|ആണോ|സുഖമാണോ)/i.test(text)) {
            processedText += '?';
        }

        // --- ലാംഗ്വേജ് ഡിറ്റക്ഷൻ ---
let lang = 'en';
if (/[क-ह]/.test(text)) lang = 'hi';         // Hindi
else if (/[ক-হ]/.test(text)) lang = 'bn';         // Bengali
else if (/[ਗ-ਹ]/.test(text)) lang = 'pa';         // Punjabi
else if (/[ક-હ]/.test(text)) lang = 'gu';         // Gujarati
else if (/[ଅ-ହ]/.test(text)) lang = 'or';         // Odia
else if (/[அ-ஹ]/.test(text)) lang = 'ta';         // Tamil
else if (/[అ-హ]/.test(text)) lang = 'te';         // Telugu
else if (/[ಅ-ಹ]/.test(text)) lang = 'kn';         // Kannada
else if (/[അ-ഹ]/.test(text)) lang = 'ml';         // Malayalam
else if (/[a-zA-Z]/.test(text)) lang = 'en';       // English

// Arabic Script (10+ languages)
else if (/[ء-ي]/.test(text)) lang = 'ar';         // Arabic
else if (/[ء-ي]/.test(text)) lang = 'ur';         // Urdu
else if (/[ء-ي]/.test(text)) lang = 'fa';         // Persian
else if (/[ء-ي]/.test(text)) lang = 'ps';         // Pashto
else if (/[ء-ي]/.test(text)) lang = 'sd';         // Sindhi
else if (/[ء-ي]/.test(text)) lang = 'ku';         // Kurdish
else if (/[ء-ي]/.test(text)) lang = 'ug';         // Uyghur
else if (/[ء-ي]/.test(text)) lang = 'dv';         // Dhivehi

// Latin Extended (30+ languages)
else if (/[a-zA-Z]/.test(text)) lang = 'en';      // English
else if (/[à-ÿ]/i.test(text)) lang = 'fr';        // French
else if (/[áéíóúñ]/i.test(text)) lang = 'es';     // Spanish
else if (/[äöüß]/i.test(text)) lang = 'de';       // German
else if (/[ąćęłńóśżź]/i.test(text)) lang = 'pl';  // Polish
else if (/[čćđšž]/i.test(text)) lang = 'hr';      // Croatian
else if (/[ăâîșț]/i.test(text)) lang = 'ro';      // Romanian
else if (/[ğış]/i.test(text)) lang = 'tr';        // Turkish
else if (/[øåæ]/i.test(text)) lang = 'da';        // Danish
else if (/[åäö]/i.test(text)) lang = 'sv';        // Swedish
else if (/[éèêç]/i.test(text)) lang = 'pt';       // Portuguese
else if (/[žšč]/i.test(text)) lang = 'sl';        // Slovenian
else if (/[ýðþ]/i.test(text)) lang = 'is';        // Icelandic
else if (/[ășț]/i.test(text)) lang = 'md';        // Moldovan

// Cyrillic Script (15+ languages)
else if (/[А-Яа-я]/.test(text)) lang = 'ru';      // Russian
else if (/[А-Яа-я]/.test(text)) lang = 'uk';      // Ukrainian
else if (/[А-Яа-я]/.test(text)) lang = 'bg';      // Bulgarian
else if (/[А-Яа-я]/.test(text)) lang = 'sr';      // Serbian
else if (/[А-Яа-я]/.test(text)) lang = 'mk';      // Macedonian
else if (/[А-Яа-я]/.test(text)) lang = 'kk';      // Kazakh
else if (/[А-Яа-я]/.test(text)) lang = 'uz';      // Uzbek
else if (/[А-Яа-я]/.test(text)) lang = 'mn';      // Mongolian

// East Asian
else if (/[\u4E00-\u9FFF]/.test(text)) lang = 'zh'; // Chinese
else if (/[\u3040-\u30FF]/.test(text)) lang = 'ja'; // Japanese
else if (/[\uAC00-\uD7AF]/.test(text)) lang = 'ko'; // Korean

// Southeast Asian
else if (/[\u0E00-\u0E7F]/.test(text)) lang = 'th'; // Thai
else if (/[\u0E80-\u0EFF]/.test(text)) lang = 'lo'; // Lao
else if (/[\u1780-\u17FF]/.test(text)) lang = 'km'; // Khmer
else if (/[\u1000-\u109F]/.test(text)) lang = 'my'; // Burmese

// African
else if (/[ɓɗŋ]/i.test(text)) lang = 'ha';         // Hausa
else if (/[ɛɔ]/i.test(text)) lang = 'yo';          // Yoruba
else if (/[ŋ]/i.test(text)) lang = 'ig';           // Igbo

// Others
else if (/[\u0590-\u05FF]/.test(text)) lang = 'he'; // Hebrew
else if (/[\u1200-\u137F]/.test(text)) lang = 'am'; // Amharic
else if (/[\u0980-\u09FF]/.test(text)) lang = 'as'; // Assamese

        // Direct Stream URL
        const url = googleTTS.getAudioUrl(processedText, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        await sock.sendMessage(chat, { 
            audio: audioBuffer, 
            mimetype: 'audio/ogg', 
            ptt: true,
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD SMART VOICE",
                    body: "Human-like Pronunciation Engine",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    mediaType: 1,
                    renderLargerThumbnail: true,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24"
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "Error!" });
    }
};
