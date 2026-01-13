import * as tf from '@tensorflow/tfjs-node';
import * as nsfw from 'nsfwjs';
import { downloadContentFromMessage } from '@whiskeysockets/baileys';

let model;
const loadModel = async () => {
    if (!model) model = await nsfw.load();
};
loadModel(); // ബൂട്ട് ചെയ്യുമ്പോൾ മോഡൽ ലോഡ് ചെയ്യും

export default async (sock) => {
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const type = Object.keys(msg.message)[0];
            
            // സ്കാൻ ചെയ്യേണ്ട മീഡിയ ടൈപ്പുകൾ
            const targetTypes = ['imageMessage', 'videoMessage', 'stickerMessage', 'viewOnceMessageV2'];
            if (!targetTypes.includes(type)) return;

            let mediaData = msg.message[type];
            if (type === 'viewOnceMessageV2') mediaData = msg.message[type].message.imageMessage || msg.message[type].message.videoMessage;
            if (!mediaData) return;

            // 1. ഡൗൺലോഡ് മീഡിയ (മെമ്മറിയിൽ മാത്രം, No Saving)
            const stream = await downloadContentFromMessage(mediaData, type.includes('image') ? 'image' : 'video');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 2. AI വെച്ച് പരിശോധിക്കുന്നു
            const image = tf.node.decodeImage(buffer, 3);
            const predictions = await model.classify(image);
            image.dispose(); // മെമ്മറി ഫ്രീയാക്കാൻ

            // 3. ഫലം നോക്കുന്നു (Porn, Hentai, Sexy എന്നിവ ഉണ്ടോ എന്ന്)
            const isNSFW = predictions.some(p => 
                (p.className === 'Porn' || p.className === 'Hentai' || p.className === 'Sexy') && p.probability > 0.7
            );

            if (isNSFW) {
                // മെസ്സേജ് ഡിലീറ്റ് ചെയ്യുന്നു
                await sock.sendMessage(chat, { delete: msg.key });

                // അസുര എം.ഡി വാർണിംഗ് ഡിസൈൻ
                const warnText = `*👺⃝⃘̉̉━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🔞 *NSFW DETECTED*
*✧* 「 \`👺Asura MD\` 」
*╰───────────❂*
╭•°•❲ *Action: Deleted* ❳•°•
 ⊙👤 *USER:* @${(msg.key.participant || msg.key.remoteJid).split('@')[0]}
 ⊙🚫 *REASON:* 18+ Content
╰╌╌╌╌╌╌╌╌╌╌࿐
> *© ᴄʀᴇᴀᴛᴇ BY 👺Asura MD*`;

                await sock.sendMessage(chat, { text: warnText, mentions: [msg.key.participant || msg.key.remoteJid] });
            }
        } catch (err) {
 
            console.error("NSFW Scan Error:", err.message);
        }
    });
};
