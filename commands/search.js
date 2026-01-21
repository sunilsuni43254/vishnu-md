import googleIt from 'google-it';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    // സെർച്ച് ചെയ്യേണ്ട കാര്യമുണ്ടോ എന്ന് നോക്കുന്നു
    if (!text) return sock.sendMessage(chat, { text: "*.Search Who is mooki*" }, { quoted: msg });

    try {
       
        const results = await googleIt({ 
            query: text, 
            'no-display': true,
            limit: 5 
        });

        if (!results || results.length === 0) {
            return sock.sendMessage(chat, { text: "❌ Error" });
        }

        // ടെക്സ്റ്റ് മെസ്സേജ് നിർമ്മാണം
        let replyText = `🌐 * SEARCH RESULTS* 🌐\n\n`;
        replyText += `*Query:* _${text}_\n`;
        replyText += `───────────────────\n\n`;

        results.forEach((res, index) => {
            replyText += `*${index + 1}. ${res.title}*\n`;
            replyText += `🔗 ${res.link}\n`;
            replyText += `📖 ${res.snippet}\n\n`;
        });

        replyText += `───────────────────\n*ASURA MD SEARCH SYSTEM*`;

    
        await sock.sendMessage(chat, { 
            text: replyText,
            contextInfo: {
                showAdAttribution: true 
            }
        }, { quoted: msg });

    } catch (e) {
        console.error("Google-It Error:", e);
        await sock.sendMessage(chat, { text: "❌ ERROR" });
    }
};
