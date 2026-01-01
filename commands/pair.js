const { fs } = require('fs');

// ... (മറ്റ് കണക്ഷൻ കോഡുകൾ)

if (!sock.authState.creds.registered) {
    const phoneNumber = await question('Enter your WhatsApp number: ');
    const code = await sock.requestPairingCode(phoneNumber);
    
    // പെയറിംഗ് കോഡ് ടെർമിനലിൽ കാണിക്കുന്നു
    console.log(`Your Pairing Code: ${code}`);

    // മെസ്സേജ് ഡിസൈൻ
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.ogg';
    
    const pairMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*Hello! I'm Asura MD Whatsapp Mini Bot✨*

╭╌❲ *ᴄᴏᴘʏ ᴄᴏᴅᴇ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 :- Asura MD
╎ ⊙ 𝙿𝚊𝚒𝚛 𝚌𝚘𝚍𝚎 :- *${code}*
╰╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    // കോഡ് അയക്കാൻ (നമ്പർ jid ഫോർമാറ്റിലേക്ക് മാറ്റണം)
    const userJid = phoneNumber + '@s.whatsapp.net';

    // 1. ഫോട്ടോയും കോഡും അയക്കുന്നു
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(userJid, { image: fs.readFileSync(imagePath), caption: pairMsg });
    } else {
        await sock.sendMessage(userJid, { text: pairMsg });
    }

    // 2. ഓഡിയോ (song.ogg) അയക്കുന്നു
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(userJid, { 
            audio: fs.readFileSync(songPath), 
            mimetype: 'audio/mp4', 
            ptt: true // true നൽകിയാൽ വോയിസ് നോട്ട് ആയി പോകും
        });
    }
}
