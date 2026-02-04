import fs from "fs";
import path from "path";

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.sender;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi";
    const name = "arun•°Cumar";
    
    const thumbPath = './media/thumb.jpg';
    const audioPath = './media/song.opus';

    try {
        // 1. Send Reaction
        await sock.sendMessage(from, { react: { text: "💰", key: msg.key } });

        // 2. Modern Professional Text Design (Standard Markdown)
        const donateText = `
👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
*───「 ASURA-MD SUPPORT 」───*

*👋🏻 Hello,* @${sender.split('@')[0]}

🔸️ If you appreciate this project, consider supporting its maintenance with a small donation.

*🔑 ID:* #${Math.floor(1000 + Math.random() * 9000)}
*📜 STATUS:* Pending Verification ✅

*『 PAYMENT DETAILS 』*
━━━━━━━━━━━━━━━━
⊙ *🤑 Paye:* ${name}
⊙ *🪙 Amount:* INR ${amount}.00
⊙ *💳 UPI ID:* \`${myUpi}\`
━━━━━━━━━━━━━━━━

*🔗 QUICK PAYMENT LINK:*
https://pay.upilink.in/pay/${myUpi}?am=${amount}

> Please share the screenshot after successful payment. Thank you for your support! 👺

*© ASURA MD | arun•°Cumar*`;

        // 3. Send Voice Note (Optional Professional Touch)
        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: msg });
        }

        // 4. Send Main Message with Image (High Compatibility Mode)
        await sock.sendMessage(from, {
            image: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: 'https://files.catbox.moe/9e4b39.jpg' },
            caption: donateText,
            mentions: [sender],
            contextInfo: {
                // This part provides the "link preview" look but doesn't break the message if it fails
                externalAdReply: {
                    title: "ASURA MD - SECURE PAYMENT",
                    body: "Support the development",
                    thumbnail: fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null,
                    sourceUrl: "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24",
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

    } catch (e) {
        console.error('Donate Command Error:', e);
        // Fallback to simple text if everything fails
        await sock.sendMessage(from, { text: `Contact Admin for Payment: ${myUpi}` });
    }
};
