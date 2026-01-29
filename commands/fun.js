import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const pushName = msg.pushName || "Human";

    try {
        // 1. Initial Reaction
        await sock.sendMessage(chat, { react: { text: "🤣", key: msg.key } });

        // 2. 10-Level Roasting Animation
        const { key } = await sock.sendMessage(chat, { text: "👺 Asura Brain Scanner Starting..." });

        const levels = [
            { p: "10%", m: "🔍 Scanning for signs of intelligence..." },
            { p: "20%", m: "⚠️ Error: Brain cells not found. Searching again..." },
            { p: "30%", m: "🧬 Analyzing DNA: 50% Human, 50% Monkey..." },
            { p: "40%", m: "🕵️ Locating common sense... Still 0% found." },
            { p: "50%", m: "🧪 Experimenting: What happens if we add logic? (Failed)" },
            { p: "60%", m: "🤡 Level 6: Clown Energy detected at maximum!" },
            { p: "70%", m: "🛸 Calling Aliens to take you back home..." },
            { p: "80%", m: "🧼 Washing your dirty thoughts... Please wait." },
            { p: "90%", m: "🔥 Preparing the final roast for @${pushName}..." },
            { p: "100%", m: "👺 SCAN COMPLETE: YOU ARE A CERTIFIED LEGENDARY IDIOT!" }
        ];

        for (let level of levels) {
            await new Promise(resolve => setTimeout(resolve, 1000)); 
            let bar = "▰".repeat(Math.floor(parseInt(level.p)/10)) + "▱".repeat(10 - Math.floor(parseInt(level.p)/10));
            await sock.sendMessage(chat, { text: `*${bar} ${level.p}*\n${level.m}`, edit: key });
        }

        // 3. Final Design Caption
        const funText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🧪 *Asura Roast Report*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Diagnostic Result* ❳•°•
 ⊙🎭 *TYPE:* Professional Joker
╰━━━━━━━━━━━━━━┈⊷
 ⊙🧠 *BRAIN SIZE:* Peanut
╰━━━━━━━━━━━━━━┈⊷
 ⊙🔋 *IQ LEVEL:* -999%
╰━━━━━━━━━━━━━━┈⊷
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃👺 *Roast Activated for:* ${pushName}
┃
┃⁣🤣 If stupidity was a job, you'd be a CEO!
╰━━━━━━━━━━━━━━┈⊷
┃🚶‍♂️ Your brain is like Internet Explorer.
╰━━━━━━━━━━━━━━┈⊷
┃📦 Even Google can't find your logic.
╰━━━━━━━━━━━━━━┈⊷
┃💀 You are the reason shampoo has instructions.
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

        const imagePath = './media/thumb.jpg';
        const songPath = './media/song.opus';

        // 4. Send Results with Image
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: { url: imagePath }, 
                caption: funText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: funText }, { quoted: msg });
        }

        // 5. Send Audio (Funky/Funny track)
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

        // Final Reaction
        await sock.sendMessage(chat, { react: { text: "💀", key: msg.key } });

    } catch (error) {
        console.error("Ultimate Fun Error:", error);
    }
};
