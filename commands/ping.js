const fs = require('fs');

// ബോട്ട് ഈ ഫയൽ ലോഡ് ചെയ്ത സമയം മുതൽ ഉള്ള അപ്‌ടൈം
const startTime = Date.now();

module.exports = {
    name: 'ping',
    async execute(sock, msg, args) {
        const from = msg.key.remoteJid;
        const imagePath = './media/thumb.jpg';

        // 1. Ping കണക്കാക്കുന്നു (മെസ്സേജ് അയച്ച സമയം വെച്ച്)
        const timestamp = Date.now();
        const ping = timestamp - (msg.messageTimestamp * 1000);

        // 2. Uptime കണക്കാക്കുന്നു
        const now = Date.now();
        const diff = now - startTime;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 ```👺Asura MD``` 」
*╰─────────────────❂*
*Hello! I'm Asura MD, your fastest Assistant - alive and sparkling now! ✨*

╭╌❲ *ʙᴏᴛ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 : Asura MD
╎ ⊙ 𝙿𝚒𝚗𝚐    : ${ping} 𝚖𝚜
╎ ⊙ 𝚄𝚙𝚝𝚒𝚖𝚎  : ${uptimeString}
╎ ⊙ 𝙾𝚠𝚗𝚎𝚛𝚜   : arun.Cumar
╰╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // ഇമേജ് വരുമോ എന്ന് ചോദിച്ചല്ലോ, fs.existsSync വഴി പാത്ത് കറക്റ്റ് ആണെങ്കിൽ ഉറപ്പായും വരും
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(from, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            });
        } else {
            // ഇമേജ് ഇല്ലെങ്കിൽ ടെക്സ്റ്റ് മാത്രമായി അയക്കും
            await sock.sendMessage(from, { text: pingMsg });
        }
    }
};
