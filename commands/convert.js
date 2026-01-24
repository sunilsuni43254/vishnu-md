import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { Sticker, StickerTypes } from 'wa-sticker-formatter'; 

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage || msg.message?.viewOnceMessageV2?.message || null;
    const cmd = args[0]?.toLowerCase();

    // കമാൻഡ് ലിസ്റ്റ് (സഹായത്തിനായി)
    const helpText = `*👺 ASURA MD CONVERTER 👺*

*COMMANDS:*
• *.convert sticker* - Image/Video to Sticker
• *.convert image* - Sticker to Image
• *.convert video* - GIF to Video
• *.convert gif* - Video to GIF
• *.convert audio* - Video to Audio (MP3)
• *.convert voice* - Audio to Voice Note (PTT)
• *.convert pdf* - Image/Doc to PDF
• *.convert text* - Image to Text (OCR)
• *.convert emoji* - Sticker to Emoji (PNG)`;

    if (!quoted && !args[1]) return sock.sendMessage(chat, { text: helpText }, { quoted: msg });

    try {
        const type = Object.keys(quoted || {})[0];
        const mime = quoted?.[type]?.mimetype || "";
        let buffer;

        // മീഡിയ ഡൗൺലോഡ് പ്രോസസ്സ് (ടെക്സ്റ്റ് കൺവേർഷൻ അല്ലാത്തവയ്ക്ക്)
        if (quoted && cmd !== 'text') {
            const stream = await downloadContentFromMessage(quoted[type], type.replace('Message', '').toLowerCase());
            buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
        }

        const send = async (data) => sock.sendMessage(chat, data, { quoted: msg });

        switch (cmd) {
            case 'sticker':
                if (!/image|video/.test(mime)) return send({ text: "❌ send photo!" });
                const sBuffer = new Sticker(buffer, { pack: 'Asura MD', author: 'Arun', type: StickerTypes.FULL });
                return await send({ sticker: await sBuffer.toBuffer() });

            case 'image':
                if (!/sticker/.test(mime)) return send({ text: "❌ Reply!" });
                return await send({ image: buffer, caption: "✅ *Converted to Image*" });

            case 'pdf':
                return await send({ 
                    document: buffer, 
                    mimetype: 'application/pdf', 
                    fileName: `Asura_MD_${Date.now()}.pdf` 
                });

            case 'video':
                if (!/video|gif/.test(mime)) return send({ text: "❌ GIF-ന് റിപ്ലൈ നൽകുക!" });
                return await send({ video: buffer, caption: "✅ *Converted to Video*" });

            case 'gif':
                if (!/video/.test(mime)) return send({ text: "❌ വീഡിയോയ്ക്ക് റിപ്ലൈ നൽകുക!" });
                return await send({ video: buffer, gifPlayback: true, caption: "✅ *Converted to GIF*" });

            case 'audio':
                if (!/video|audio/.test(mime)) return send({ text: "❌ വീഡിയോ/ഓഡിയോ നൽകുക!" });
                return await send({ audio: buffer, mimetype: 'audio/mp4' });

            case 'voice':
                if (!/audio|video/.test(mime)) return send({ text: "❌ ഓഡിയോ/വീഡിയോ നൽകുക!" });
                return await send({ audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: true });

            case 'text':
                return send({ text: "🔍 *OCR Feature:* ഈ ഫീച്ചറിന് Tesseract engine ആവശ്യമാണ്. തൽക്കാലം മീഡിയ വിവരങ്ങൾ ഇതാ: \nType: " + type });

            case 'emoji':
                if (!/sticker/.test(mime)) return send({ text: "❌ സ്റ്റിക്കറിന് റിപ്ലൈ നൽകുക!" });
                return await send({ 
                    document: buffer, 
                    mimetype: 'image/png', 
                    fileName: `emoji_${Date.now()}.png` 
                });

            default:
                return send({ text: helpText });
        }

    } catch (e) {
        console.error(e);
        return send({ text: "❌ *Error:* പ്രോസസ്സിംഗ് പരാജയപ്പെട്ടു!" });
    }
};
