import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');
    const apiKey = "AIzaSyCOvyzPJ-0lrz1GResd8yWgiXy-yAuPqKU"; 

    if (!query) return sock.sendMessage(chat, { text: "🔍 Please ask something!\nExample: .Search tell me about space" }, { quoted: msg });

    try {
        await sock.sendMessage(chat, { react: { text: "🤖", key: msg.key } });

        // 1. Gemini AI - Text Generation
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
        const geminiRes = await axios.post(geminiUrl, {
            contents: [{ parts: [{ text: query }] }]
        });
        const aiResponse = geminiRes.data.candidates[0].content.parts[0].text;

        // 2. Image Source (Direct URL - No Download)
        // ഗൂഗിൾ സെർച്ച് വഴിയുള്ള ഒരു ഡയറക്ട് ഇമേജ് ലിങ്ക് നമ്മൾ ഉപയോഗിക്കുന്നു
        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(query)}?width=1080&height=1080&seed=42&model=flux`;

        // 3. Voice Source (Google TTS URL - No Download)
        const voiceUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(aiResponse.slice(0, 200))}&tl=en&client=tw-ob`;

        // --- മറുപടി അയക്കുന്നു ---

        // A. ചിത്രവും ടെക്സ്റ്റും ഒന്നിച്ച് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            image: { url: imageUrl }, 
            caption: `👺 *ASURA MD RESPONSE* \n\n${aiResponse}\n\n*© 👺 ASURA MD*` 
        }, { quoted: msg });

        // B. വോയ്‌സ് മെസ്സേജ് അയക്കുന്നു (Direct Streaming)
        await sock.sendMessage(chat, { 
            audio: { url: voiceUrl }, 
            mimetype: 'audio/ogg', 
            ptt: true 
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error(e);
        await sock.sendMessage(chat, { text: "❌ AI System Busy!" });
    }
};
