import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Database ഉറപ്പാക്കുന്നു
const DB_PATH = './media/asura_db.json';
if (!fs.existsSync('./media')) fs.mkdirSync('./media');

const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const genAI = new GoogleGenerativeAI("AIzaSyAjdhkNjek2l9VCm6N9upQ5L1WuZvb-CC4");

const messageCount = {};

export const handleEvents = async (sock) => {

    // --- 1. MESSAGE EVENTS ---
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const sender = msg.key.participant || msg.key.remoteJid;
            const isGroup = chat.endsWith('@g.us');
            const db = getDB();
            const settings = db[chat] || {};
            const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || "";

            // --- MODE CHECK ---
            const ownerNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
            const isOwner = msg.key.remoteJid === ownerNumber || sender === ownerNumber;
            const botMode = db.botMode || 'public';

            if (botMode === 'private' && !isOwner && body.startsWith('.')) return;

            // --- ANTILINK ---
            if (isGroup && settings.antilink && body.includes('chat.whatsapp.com')) {
                const metadata = await sock.groupMetadata(chat);
                const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
                if (!isAdmin) {
                    await sock.sendMessage(chat, { delete: msg.key });
                    await sock.groupParticipantsUpdate(chat, [sender], "remove");
                    return;
                }
            }

            // --- ANTI-SPAM (3 Repetitions) ---
            if (isGroup && settings.antispam) {
                if (!messageCount[sender]) messageCount[sender] = { count: 1, lastMsg: body };
                if (messageCount[sender].lastMsg === body) messageCount[sender].count++;
                else { messageCount[sender].count = 1; messageCount[sender].lastMsg = body; }

                if (messageCount[sender].count > 3) {
                    await sock.sendMessage(chat, { delete: msg.key });
                    return;
                }
            }

            // --- ANTIDELETE (Big Text - 10 Lines) ---
            if (isGroup && settings.antidelete && body.split('\n').length > 10) {
                await sock.sendMessage(chat, { delete: msg.key });
                await sock.sendMessage(chat, { text: "🚫 *Big Text Removed!*" });
                return;
            }

            // --- CHATBOT ---
            if (settings.chatbot && !body.startsWith('.') && !msg.key.fromMe) {
                try {
                    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
                    const result = await model.generateContent(body);
                    const response = await result.response;
                    await sock.sendMessage(chat, { text: `*👺 ASURA AI*\n\n${response.text()}` }, { quoted: msg });
                } catch (err) { console.error("AI Error:", err); }
            }

            // --- ANTIFOREIGN SCAN ON COMMAND ---
            if (isGroup && body === '.group antiforeign on') {
                const metadata = await sock.groupMetadata(chat);
                const foreignNumbers = metadata.participants.filter(p => !p.id.startsWith('91') && !p.admin).map(p => p.id);
                if (foreignNumbers.length > 0) {
                    await sock.sendMessage(chat, { text: `🕵️‍♂️ *Scanning...* Found ${foreignNumbers.length} foreign numbers. Removing...` });
                    for (let jid of foreignNumbers) {
                        await sock.groupParticipantsUpdate(chat, [jid], "remove");
                    }
                }
            }
        } catch (e) { console.error("Error in messages.upsert:", e); }
    });

    // --- 2. PARTICIPANT UPDATES ---
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            const db = getDB();
            const settings = db[id] || {};

            if (action === 'add') {
                for (let num of participants) {
                    // Anti-foreign Check
                    if (settings.antiforeign && !num.startsWith('91')) {
                        await sock.groupParticipantsUpdate(id, [num], "remove");
                        continue;
                    }
                    // Welcome Message
                    if (settings.welcome) {
                        const metadata = await sock.groupMetadata(id);
                        await sock.sendMessage(id, { 
                            text: `👋🏻 Hey @${num.split('@')[0]} Welcome to *${metadata.subject}* Group 🥰🥰`, 
                            mentions: [num] 
                        });
                    }
                }
            }
        } catch (e) { console.error("Error in participant update:", e); }
    });

    // --- 3. ANTI-CALL ---
    sock.ev.on('call', async (call) => {
        const db = getDB();
        if (db['global']?.anticall) {
            await sock.updateBlockStatus(call[0].from, "block");
        }
    });
};
