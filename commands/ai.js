import axios from 'axios';
import fs from 'fs';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const text = args.join(" ");
    const imagePath = './media/thumb.jpg'; 

    if (!text) {
        return sock.sendMessage(from, { text: "❌ Please provide a question!\nExample: .ai who is Cristiano Ronaldo?" });
    }

    try {
        // 1. റിയാക്ഷൻ നൽകുന്നു
        await sock.sendMessage(from, { react: { text: "🧠", key: msg.key } });

        // 2. ആനിമേഷൻ (Thinking...)
        const { key } = await sock.sendMessage(from, { text: "👺 Asura AI is thinking..." });
        
        // 3. AI API (അതിവേഗം മറുപടി നൽകുന്ന പുതിയ സർവീസ്)
        const response = await axios.get(`https://itzpire.com/ai/gpt-4?q=${encodeURIComponent(text)}`);
        
        // ചിലപ്പോൾ response.data.result-ൽ ആയിരിക്കും ആൻസർ വരുന്നത്
        const aiResponse = response.data.data || response.data.result || "I couldn't process that.";

        const aiMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴀꜱᴜʀᴀ ᴍᴅ ꜱᴍᴀʀᴛ ᴀɪ*
*✧* 「 \`👺Asura MD\` 」
*╰──────────❂*

${aiResponse}

╭╌❲ *👺Asura MD Intelligence* ❳
╎ ⊙ 𝚀𝚞𝚎𝚛𝚢 : ${text.length > 20 ? text.substring(0, 20) + "..." : text}
╎ ⊙ 𝙼𝚘𝚍𝚎𝚕 : GPT-4 Turbo
╰╌╌╌╌╌╌╌╌╌╌࿐
╠━━━━━━━━━❥❥❥
┃ *owner* arun.Cumar 
╚━━━⛥❖⛥━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 4. Thumbnail 
        if (fs.existsSync(imagePath)) {
         
            await sock.sendMessage(from, { delete: key });
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: aiMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(from, { text: aiMsg, edit: key });
        }

        await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("AI Chat Error:", e);
        await sock.sendMessage(from, { text: "❌ error" });
    }
};
