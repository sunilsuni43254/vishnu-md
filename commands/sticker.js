import { Sticker, StickerTypes } from 'wa-sticker-formatter';
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import fs from "fs";

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;

    try {
        // 1. Identify the message type (Direct or Quoted)
        const type = Object.keys(msg.message || {})[0];
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        // 2. Extract Media Message (Support for Image, Video, Document, ViewOnce)
        let mediaMessage = msg.message?.imageMessage || 
                           msg.message?.videoMessage || 
                           quoted?.imageMessage || 
                           quoted?.videoMessage || 
                           quoted?.documentWithCaptionMessage?.message?.videoMessage ||
                           quoted?.documentWithCaptionMessage?.message?.imageMessage ||
                           msg.message?.viewOnceMessageV2?.message?.imageMessage || 
                           msg.message?.viewOnceMessageV2?.message?.videoMessage;

        // 3. If no media found, show Professional Help Menu
        if (!mediaMessage) {
            const helpMenu = `*👺 ASURA MD STICKER ENGINE* \n\n` +
                             `*Reply to any media to convert:* \n` +
                             `◈ _Images & Documents_\n` +
                             `◈ _Videos & GIFs_\n` +
                             `◈ _ViewOnce Media_\n\n` +
                             `> *Usage:* Send .sticker as a reply`;
            return sock.sendMessage(chat, { text: helpMenu }, { quoted: msg });
        }

        // 4. Determine Media Type for Downloader
        const isVideo = mediaMessage.hasOwnProperty('videoMessage') || 
                        (mediaMessage.mimetype && mediaMessage.mimetype.includes('video'));
        const downloadType = isVideo ? 'video' : 'image';

        // 5. Visual Feedback
        await sock.sendMessage(chat, { react: { text: "🎨", key: msg.key } });

        // 6. Download Media Content
        const stream = await downloadContentFromMessage(mediaMessage, downloadType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        // 7. Sticker Configuration (Professional Grade)
        const sticker = new Sticker(buffer, {
            pack: 'Asura MD Pack 👺',
            author: 'Arun Cumar',
            type: StickerTypes.FULL, 
            categories: ['🔥', '✨'],
            id: 'asura_pro_sticker',
            quality: 30 
        });

        // 8. Generate and Send
        const stickerBuffer = await sticker.toBuffer();
        await sock.sendMessage(chat, { sticker: stickerBuffer }, { quoted: msg });

    } catch (error) {
        console.error("Sticker Engine Error:", error);
        await sock.sendMessage(chat, { text: "❌ *Error:* Failed to process sticker. Ensure the file is not corrupted." });
    }
};
