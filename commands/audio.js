import { Api, TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";

const apiId = 12938494; 
const apiHash = "bdbdfa189d74ffd44b5be4bed1a26247";
const botToken = "7599052852:AAEMW-41BN1j3FwjkTN7bUkTTcliGAt5z8A";
const channelId = "-1001891724070";

const client = new TelegramClient(new StringSession(""), apiId, apiHash, { connectionRetries: 5 });
let isStarted = false;
let audioCache = new Map();

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.key.participant || from;
    const text = (msg.message?.conversation || 
                  msg.message?.extendedTextMessage?.text || "").trim().toLowerCase();

    try {
        if (!isStarted) {
            await client.start({ botAuthToken: botToken });
            isStarted = true;
        }

        if (text === '.audio' || text === '.music') {
            await sock.sendMessage(from, { text: "🔍 *Searching in Asura DB...*" });

            const randomOffset = Math.floor(Math.random() * 100);

            // ബോട്ടുകൾക്ക് അനുവദനീയമായ സെർച്ച് മെത്തേഡ്
            const result = await client.invoke(
                new Api.messages.Search({
                    peer: channelId,
                    filter: new Api.InputMessagesFilterMusic(), 
                    q: "", 
                    limit: 50,
                    offsetId: 0,
                    addOffset: randomOffset
                })
            );

            const allAudios = result.messages;

            if (!allAudios || allAudios.length === 0) {
                return sock.sendMessage(from, { text: "❌ *No audio found!*" });
            }

            const shuffled = allAudios.sort(() => 0.5 - Math.random()).slice(0, 15);
            audioCache.set(sender, shuffled);

            let listMsg = `*👺 ASURA MD audio DB*\n\n`;
            shuffled.forEach((m, index) => {
                const attr = m.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);
                const title = attr?.title || "Unknown Track";
                listMsg += `*${index + 1}* ➠ ${title}\n\n`;
            });

            listMsg += `> *Reply with number to play!*`;
            return await sock.sendMessage(from, { text: listMsg }, { quoted: msg });
        }

        // പ്ലേ ചെയ്യാനുള്ള ലോജിക്
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo;
        if (quotedMsg && quotedMsg.quotedMessage && !isNaN(text)) {
            const quotedText = quotedMsg.quotedMessage.conversation || quotedMsg.quotedMessage.extendedTextMessage?.text || "";
            
            if (quotedText.includes("ASURA MD")) {
                const index = parseInt(text) - 1;
                const userFiles = audioCache.get(sender);

                if (!userFiles || !userFiles[index]) return;

                const selected = userFiles[index];
                await sock.sendMessage(from, { text: `⚡ *Fetching audio...*` }, { quoted: msg });

                // വാട്സാപ്പിലേക്ക് അയക്കാൻ മീഡിയ ഡൗൺലോഡ് ചെയ്ത് ബഫർ എടുക്കണം
                const buffer = await client.downloadMedia(selected.media, { workers: 4 });
                const attr = selected.media.document.attributes.find(a => a instanceof Api.DocumentAttributeAudio);

                await sock.sendMessage(from, {
                    audio: buffer,
                    mimetype: "audio/mpeg",
                    fileName: `${attr?.title || 'Asura'}.mp3`,
                    header: attr?.title || "Asura Music"
                }, { quoted: msg });
            }
        }

    } catch (error) {
        console.error("Error Log:", error);
    }
};
