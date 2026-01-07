Import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    // 1. റിയാക്ഷൻ നൽകുന്നു
    await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

    // 2. ആനിമേഷൻ തുടങ്ങുന്നു (Editing Message)
    const { key } = await sock.sendMessage(chat, { text: "👺 Asura MD Loading..." });

    const frames = [
        "▰▱▱▱▱▱▱▱▱▱ 10%",
        "▰▰▰▱▱▱▱▱▱▱ 30%",
        "▰▰▰▰▰▱▱▱▱▱ 50%",
        "▰▰▰▰▰▰▰▱▱▱ 80%",
        "▰▰▰▰▰▰▰▰▰▰ 100%",
        "🚀 Initializing Asura Engine...",
        "👺 Done! Sending Files..."
        "🙂"
        "😀"
        "😄"
        "😁"
        "😆"
        "😅"
        "😂"
        "🤣"
        "😂"
        "🙂"
        "😀"
        "😄"
        "😁"
        "😆"
        "😅"
        "😂"
        "🤣"
    ];

    for (let frame of frames) {
        await new Promise(resolve => setTimeout(resolve, 800)); // 0.8 സെക്കൻഡ് ഗ്യാപ്പ്
        await sock.sendMessage(chat, { text: frame, edit: key });
    }

    // 3. ഫൈനൽ ഡിസൈൻ ക്യാപ്ഷൻ
    const infoText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Asura Fun Service*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*
╭•°•❲ *Process Completed* ❳•°•
 ⊙🎬 *STATUS:* SUCCESS ✅
 ⊙📺 *SERVICE:* FUN MOD
 ⊙⏳ *SPEED:* 1.2ms
*◀︎ •၊၊||၊||||။‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌࿐
╔━━━━━━━━━━━❥❥❥
┃ 👺 Asura Fun Mode Activated!
╚━━━━⛥❖⛥━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 4. പഴയ മെസ്സേജ് ഡിലീറ്റ് ചെയ്തിട്ട് പുതിയ ഇമേജും പാട്ടും അയക്കുന്നു
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { 
            image: { url: imagePath }, 
            caption: infoText 
        }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: infoText }, { quoted: msg });
    }

    // 5. ഓഡിയോ ഫയൽ (PTT ആയി) അയക്കുന്നു
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(chat, { 
            audio: { url: songPath }, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        }, { quoted: msg });
    }

    // ലോഡിംഗ് ടെക്സ്റ്റ് അവസാനം മാറ്റുന്നു അല്ലെങ്കിൽ ഡിലീറ്റ് ചെയ്യുന്നു
    await sock.sendMessage(chat, { react: { text: "🤣", key: msg.key } });
};
