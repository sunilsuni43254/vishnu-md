import { Sticker, StickerTypes } from 'fancy-sticker-generator'; // മെച്ചപ്പെട്ട ലൈബ്രറി
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';
    const songPath = './media/song.opus';

    // ഫോട്ടോ, വീഡിയോ, ജിഫ് എന്നിവ ചെക്ക് ചെയ്യുന്നു
    const message = msg.message?.imageMessage || 
                    msg.message?.videoMessage || 
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage || 
                    msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

    const type = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ? 'image' : 'video';

    try {
        if (!message) {
            const helpMsg = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
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
                return sock.sendMessage(chat, { image: fs.readFileSync(imagePath), caption: helpMsg });
            } else {
                return sock.sendMessage(chat, { text: helpMsg });
            }
        }

        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(message, type);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // സ്റ്റിക്കർ ഫോർമാറ്റ് ചെയ്യുന്നു
        const sticker = new Sticker(buffer, {
            pack: 'Asura MD 👺', // സ്റ്റിക്കർ പാക്ക് പേര്
            author: 'Arun Cumar', // സ്റ്റിക്കർ ഓതർ
            type: StickerTypes.FULL, // സ്റ്റിക്കർ സൈസ്
            categories: ['🤩', '🎉'],
            id: '12345',
            quality: 70, // ക്വാളിറ്റി
        });

        const stickerBuffer = await sticker.toBuffer();

        // സ്റ്റിക്കർ അയക്കുന്നു
        await sock.sendMessage(chat, { sticker: stickerBuffer }, { quoted: msg });

        // കൂടെ നിങ്ങളുടെ പാട്ട് വരണമെന്നുണ്ടെങ്കിൽ താഴെ വരികൾ ഉപയോഗിക്കാം
        if (fs.existsSync(songPath)) {
            await sock.sendMessage(chat, { 
                audio: { url: songPath }, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("Sticker Error:", error);
        sock.sendMessage(chat, { text: "Not Found! ❌" });
    }
};
