import fs from 'fs';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg';
    const phoneNumber = args[0]; 

    if (!phoneNumber) {
        return sock.sendMessage(chat, { 
            text: "❌ *Please provide your phone number with country code!*\n\nExample: `.pair 91XXXXXXXXXX`" 
        });
    }

    const pairMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴀꜱᴜʀᴀ ᴍᴅ ᴘᴀɪʀɪɴɢ*
*✧* 「 👺Asura MD 」
*╰─────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *📱 Number:* ${phoneNumber}
┃ *📡 Status:* Requesting Code...
┃ *⚠️ Note:* Do not share your code!
╠━━━━━━━━━━━━━❥❥❥
┃ *Step 1:* Copy the code below.
┃ *Step 2:* Open WhatsApp Notifications.
┃ *Step 3:* Click 'Link Device' & Paste.
╚━━━━━⛥❖⛥━━━━━❥❥❥
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

    try {
        await sock.sendMessage(chat, { react: { text: "⏳", key: msg.key } });

        // index.js 
        let code = await sock.requestPairingCode(phoneNumber);
        
        const finalCode = code?.match(/.{1,4}/g)?.join('-') || code;

        if (fs.existsSync(thumbPath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(thumbPath), 
                caption: pairMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: pairMsg }, { quoted: msg });
        }

        // easy copy)
        await sock.sendMessage(chat, { 
            text: `*YOUR PAIRING CODE:* \n\n#️⃣ *${finalCode}*` 
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "✅", key: msg.key } });

    } catch (e) {
        console.error("Pairing Error:", e);
        await sock.sendMessage(chat, { 
            text: "❌ *Error:* " 
        });
    }
};
