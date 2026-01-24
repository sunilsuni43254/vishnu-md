import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // ക്വോട്ട് ചെയ്ത മെസ്സേജോ നേരിട്ടുള്ള മെസ്സേജോ എന്ന് പരിശോധിക്കുന്നു
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const message = msg.message?.imageMessage || msg.message?.videoMessage || 
                    quoted?.imageMessage || quoted?.videoMessage;

    try {
        if (!message) {
            const helpMsg = `
*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to Image/Gif/Video*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

            if (fs.existsSync(imagePath)) {
                return sock.sendMessage(chat, { image: { url: imagePath }, caption: helpMsg });
            } else {
                return sock.sendMessage(chat, { text: helpMsg });
            }
        }

        // മീഡിയ ടൈപ്പ് കണ്ടെത്തുന്നു (Image/Video/Gif)
        const mediaType = (message === msg.message?.imageMessage || message === quoted?.imageMessage) ? 'image' : 'video';

        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(message, mediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // സ്റ്റിക്കർ സെറ്റിംഗ്‌സ്
        const sticker = new Sticker(buffer, {
            pack: 'Asura MD 👺', 
            author: 'Arun Cumar', 
            type: StickerTypes.FULL, 
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 30, 
        });

        // സ്റ്റിക്കർ ബഫർ നിർമ്മിച്ച് നേരിട്ട് അയക്കുന്നു
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(chat, { sticker: stickerBuffer }, { quoted: msg });

        // ഓഡിയോ അയക്കുന്നു
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Sticker Error:", error);
        sock.sendMessage(chat, { text: "😁" });
    }
};
