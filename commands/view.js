import { downloadContentFromMessage } from '@whiskeysockets/baileys';

export default async (sock, msg) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;

    // 1. Check if the message is a reply
    if (!quoted || !quoted.quotedMessage) {
        return sock.sendMessage(chat, { text: "❌ Please reply to a *View Once* message!" }, { quoted: msg });
    }

    let qMsg = quoted.quotedMessage;

    // 2. Resolve ViewOnce Message (v2 and v2Extension support)
    if (qMsg.viewOnceMessageV2) qMsg = qMsg.viewOnceMessageV2.message;
    else if (qMsg.viewOnceMessageV2Extension) qMsg = qMsg.viewOnceMessageV2Extension.message;

    // 3. Identify Media Type
    const mType = Object.keys(qMsg)[0];
    const media = qMsg[mType];

    // Validate if it's actual view-once media
    if (!['imageMessage', 'videoMessage', 'audioMessage'].includes(mType)) {
        return sock.sendMessage(chat, { text: "❌ Valid View-Once media not found!" }, { quoted: msg });
    }

    try {
        // 4. Download content to memory buffer (No local storage)
        const mediaType = mType.replace('Message', '');
        const stream = await downloadContentFromMessage(media, mediaType);
        
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }

        const responseCaption = `> *👺⃝⃘̉ Asura MD View-Once*`;

        // 5. Re-send based on type
        if (mType === 'imageMessage') {
            await sock.sendMessage(chat, { image: buffer, caption: responseCaption }, { quoted: msg });
        } 
        else if (mType === 'videoMessage') {
            await sock.sendMessage(chat, { video: buffer, caption: responseCaption }, { quoted: msg });
        } 
        else if (mType === 'audioMessage') {
            await sock.sendMessage(chat, { 
                audio: buffer, 
                mimetype: 'audio/mp4', // More professional for most devices
                ptt: false 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error("ViewOnce Error:", error);
        await sock.sendMessage(chat, { text: "❌ Error: Failed to retrieve media. Content might have expired." });
    }
};
