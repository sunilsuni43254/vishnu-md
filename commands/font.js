import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import fs from 'fs';
import { font } from 'nayan-font-generator'; // ലൈബ്രറി ഇംപോർട്ട് ചെയ്യുന്നു

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(" ");

    if (!text) {
        return sock.sendMessage(chat, { text: "❌ Usage: .font [text]\nExample: .font Asura" });
    }

    // 200-ൽ അധികം ഫോണ്ടുകൾ ജനറേറ്റ് ചെയ്യുന്നു
    const allFonts = await font(text);
    
    let result = "";
    // ആദ്യത്തെ 200 എണ്ണം മാത്രം എടുക്കുന്നു (മെസ്സേജ് സൈസ് കൂടാതിരിക്കാൻ)
    allFonts.slice(0, 200).forEach((f, index) => {
        result += `┃ ${index + 1}. ${f}\n`;
    });

    const fontDesign = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Asura MD Font Engine*
*✧* 「 \`👺Asura MD\` 」
*╰───────────────❂*

╭•°•❲ *Result for: ${text}* ❳•°•
${result}     
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

    // 1. ഇമേജും ക്യാപ്ഷനും അയക്കുന്നു
    const imagePath = './media/thumb.jpg'; 
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { image: { url: imagePath }, caption: fontDesign }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: fontDesign }, { quoted: msg });
    }

    // 2. ഓഡിയോ അയക്കുന്നു
    const songPath = './media/song.opus'; 
    if (fs.existsSync(songPath)) {
        await sock.sendMessage(chat, { 
            audio: { url: songPath }, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        }, { quoted: msg });
    }
};
