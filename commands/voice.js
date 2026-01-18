import * as googleTTS from 'google-tts-api';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // ടൈപ്പ് ചെയ്ത ടെക്സ്റ്റ് എടുക്കുന്നു
    let text = args.join(' ');
    
    // ടെക്സ്റ്റ് ഇല്ലെങ്കിൽ
    if (!text) return sock.sendMessage(chat, { text: "*Example:* .voice Hello how are you?" }, { quoted: msg });

    try {
        // ഇംഗ്ലീഷ് ആണോ മലയാളം ആണോ എന്ന് നോക്കുന്നു (Default: English)
        // ആദ്യത്തെ വാക്ക് 'ml' ആണെങ്കിൽ മലയാളം, അല്ലെങ്കിൽ ഇംഗ്ലീഷ്
        let lang = 'en'; 
        if (text.startsWith('ml ')) {
            lang = 'ml';
            text = text.replace('ml ', '');
        }

        // Google TTS URL നിർമ്മിക്കുന്നു
        const url = googleTTS.getAudioUrl(text, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // വോയ്‌സ് നോട്ടായി (PTT) അയക്കുന്നു
        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/mp4', 
            ptt: true 
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "Error in generating voice!" }, { quoted: msg });
    }
};
