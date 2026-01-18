import gtts from 'google-tts-api';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: `*ഉപയോഗിക്കേണ്ട രീതി:* .voice [ഭാഷാ കോഡ്] [വാചകം]\n\n*ഉദാഹരണം:*\n.voice ml സുഖമാണോ? (മലയാളം)\n.voice en Hello how are you? (ഇംഗ്ലീഷ്)\n.voice hi नमस्ते (ഹിന്ദി)` }, { quoted: msg });

    // ഭാഷാ കോഡ് പരിശോധിക്കുന്നു (ആദ്യത്തെ 2 അക്ഷരം)
    let lang = 'ml'; // Default Malayalam
    let speechText = text;

    if (args[0].length === 2) {
        lang = args[0];
        speechText = args.slice(1).join(' ');
    }

    try {
        // Voice URL നിർമ്മിക്കുന്നു
        const url = gtts.getAudioUrl(speechText, {
            lang: lang,
            slow: false,
            host: 'https://translate.google.com',
        });

        // voice
        await sock.sendMessage(chat, { 
            audio: { url: url }, 
            mimetype: 'audio/ogg', 
            ptt: true 
        }, { quoted: msg });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "🥲Error." }, { quoted: msg });
    }
};
