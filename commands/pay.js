import fs from "fs";
import path from "path";

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi";
    const name = "arun•°Cumar";
    
    // ഫയൽ പാത്തുകൾ
    const thumbPath = './media/thumb.jpg';
    const audioPath = './media/song.opus';

    try {
        // 1. Reaction
        await sock.sendMessage(from, { react: { text: "💰", key: msg.key } });

        // UPI Link (Hide link format using Markdown)
        const upiUrl = `upi://pay?pa=${myUpi}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;

        const donateText = `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*⊙⊙■ 👺 ASURA-MD DONATE ■⊙⊙*

*Hello,* @${msg.sender.split('@')[0]}
Asura-MD-യുടെ വളർച്ചയെ സഹായിക്കാൻ ഒരു ചെറിയ തുക സംഭാവന ചെയ്യൂ. 🥰

*PAYMENT INFO*
⊙━━━━━━━━━━⊙
 👤 *Payee:* ${name}
 💰 *Amount:* ₹${amount}
 🆔 *UPI:* \`${myUpi}\`
⊙━━━━━━━━━━⊙

👉 *[CLICK HERE TO PAY](https://pay.upilink.in/pay/${myUpi}?am=${amount})*

> പണമടച്ച ശേഷം സ്ക്രീൻഷോട്ട് അയക്കുക. 👺`;

        // 2.  (song.opus)
        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

        // 3. thumb.jpg 
        await sock.sendMessage(from, {
            image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://files.catbox.moe/9e4b39.jpg' },
            caption: donateText,
            mentions: [msg.sender],
            contextInfo: {
                externalAdReply: {
                    title: "ASURA MD PAYMENT SYSTEM",
                    body: "Support & Donate",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Donate Error:', e);
        await sock.sendMessage(from, { text: `Error: ${e.message}` });
    }
};
