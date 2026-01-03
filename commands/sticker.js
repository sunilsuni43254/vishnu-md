import { exec } from "child_process";
import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // മെസ്സേജ് പരിശോധിക്കുന്നു
    const messageContent = msg.message?.imageMessage || 
                          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

    if (!messageContent) {
        const helpMsg = `*👺⃝⃘̉̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╔━━━━━━━━━━━━━❥❥❥
┃ *⊙🖼 Reply to an Image*
┃ *⊙🎨 Command: .sticker*
╠━━━━━━━━━━━━━❥❥❥
┃ *👑Creator:-* arun•°Cumar
╚━━━━━━━⛥❖⛥━━━━━━❥❥❥
> 📢 Join: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

        return sock.sendMessage(chat, { text: helpMsg });
    }

    try {

        //  Send Image
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: menuText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: menuText }, { quoted: msg });
        }
        
                // മീഡിയ ഡൗൺലോഡ് ചെ
                cons = tream = await downloadContentFromMessage(messag, ontent, ;
                le = uffer . Buffer.;
                f r awai  (con t  hunk of s
                   = uffer . Buffer.concat, buffer,;
         

                // താൽക്കാലിക ഫയൽ 
            !  .if (!fs.existsSync('./ ed.a')) fs.mkdirSync('.;
                const i = tPath = `./media/tem._${Date.now;
                const ou = tPath = `./media/tem._${Date.now(;

          .     fs.writeFileSync(i, utPath,;

                // FFmpe
                const f = egCmd = `ffmpeg -i ${inputPath} -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0,split[s0][s1];[s0]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[s1][p]paletteuse" ${outp;

                exec(f, pegCm , asy => e
                     f
                       .console.er;
                      . if (fs.existsSync(inp tP.th)) fs.unlinkSync(in;
                        ret.rn sock.sendMess, e chat: { text: "Error creating sticker! ❌ Make sure FFmpeg is ins al;
             

                    // സ്റ്റിക്കർ അയ
                    aw.it sock.sendMess, e 
                       : ti.ker: fs.readFileSync(out
              ;

                    // ഫയലുകൾ ഡിലീറ്റ് ചെ
                  . if (fs.existsSync(inp tP.th)) fs.unlinkSync(in;
                  . if (fs.existsSync(outp tP.th)) fs.unlinkSync(out;
          ;

    ) 

    } c t
               .consol;
            .   sock.sendMess, e chat: { text: "Something went wr ng;
    }
;;
