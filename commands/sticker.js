import { exec } from "child_process";
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // മെസ്സേജ് ഒരു ഇമേജ് ആണോ എന്ന് പരിശോധിക്കുന്നു
    const type = Object.keys(msg.message)[0];
    const isQuotedImage = type === 'extendedTextMessage' && msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
    const isImage = type === 'imageMessage';

    if (!isImage && !isQuotedImage) {
        return sock.sendMessage(chat, { text: " *👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹*     🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 *`👺Asura MD`* 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼Image + 🎨Sticker*
┃ *⊙🎥Video + 🎨Sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*" });
    }

    try {
        const targetMsg = isQuotedImage ? msg.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage : msg.message.imageMessage;
        
        // മീഡിയ ഡൗൺലോഡ് ചെയ്യുന്നു
        const stream = await downloadContentFromMessage(targetMsg, 'image');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const inputPath = `./media/temp_${Date.now()}.jpg`;
        const outputPath = `./media/temp_${Date.now()}.webp`;

        fs.writeFileSync(inputPath, buffer);

        // FFmpeg ഉപയോഗിച്ച് WebP (Sticker) ഫോർമാറ്റിലേക്ക് മാറ്റുന്നു
        // Pack Name ഉം Author ഉം ഇവിടെ സെറ്റ് ചെയ്യാം
        exec(`ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,split[s0][s1];[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[s1][p]paletteuse" ${outputPath}`, async (err) => {
            
            if (err) {
                console.error(err);
                return sock.sendMessage(chat, { text: "Error creating sticker! ❌" });
            }

            // സ്റ്റിക്കർ അയക്കുന്നു
            await sock.sendMessage(chat, { 
                sticker: fs.readFileSync(outputPath),
                packname: "👺Asura MD", 
                author: "Asura-Bot"
            });

            // താൽക്കാലിക ഫയലുകൾ ഡിലീറ്റ് ചെയ്യുന്നു
            fs.unlinkSync(inputPath);
            fs.unlinkSync(outputPath);
        });

    } catch (e) {
        console.log(e);
        sock.sendMessage(chat, { text: "Something went wrong! 😔" });
    }
};
