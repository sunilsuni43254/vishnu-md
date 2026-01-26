import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const DB_PATH = './media/asura_db.json';
const getDB = () => fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH)) : {};
const genAI = new GoogleGenerativeAI("AIzaSyAjdhkNjek2l9VCm6N9upQ5L1WuZvb-CC4");

export const handleEvents = async (sock) => {

    sock.ev.on('messages.upsert', async (chatUpdate) => {
        const msg = chatUpdate.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const chat = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const isGroup = chat.endsWith('@g.us');
        const db = getDB();
        
        const settings = db[chat] || {};
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || "";

        // --- 1. ANTILINK ---
        if (isGroup && settings.antilink && body.includes('chat.whatsapp.com')) {
            const metadata = await sock.groupMetadata(chat);
            const isAdmin = metadata.participants.find(p => p.id === sender)?.admin;
            if (!isAdmin) {
                await sock.sendMessage(chat, { delete: msg.key });
                await sock.groupParticipantsUpdate(chat, [sender], "remove");
            }
        }

        // --- 2. ANTI-SPAM ---
        if (isGroup && settings.antispam && body.length > 500) {
             await sock.sendMessage(chat, { delete: msg.key });
             await sock.sendMessage(chat, { text: "🚫 *Spam Detected and Removed!*" });
        }

        // --- 3. CHATBOT ---
        if (settings.chatbot && !body.startsWith('.') && !msg.key.fromMe) {
            try {
                const model = genAI.getGenerativeModel({ 
                    model: "gemini-pro",
                    systemInstruction: "You are Asura MD AI, a powerful WhatsApp assistant. Be smart and helpful. User name is " + (msg.pushName || "User")
                });
                const result = await model.generateContent(body);
                const response = await result.response;
                await sock.sendMessage(chat, { text: `*👺 ASURA AI*\n\n${response.text()}` }, { quoted: msg });
            } catch (err) {
                console.error("AI Chatbot Error:", err);
            }
        }
    }); 

    // --- 4. WELCOME & ANTI-FOREIGN NUMBER ---
    sock.ev.on('group-participants.update', async (update) => {
        const { id, participants, action } = update;
        const db = getDB();
        const settings = db[id] || {};

        if (action === 'add') {
            for (let num of participants) {
                if (settings.antiforeign && !num.startsWith('91')) {
                    await sock.groupParticipantsUpdate(id, [num], "remove");
                    continue;
                }
                if (settings.welcome) {
                    const metadata = await sock.groupMetadata(id);
                    await sock.sendMessage(id, { text: `Hello @${num.split('@')[0]} 👋\nWelcome to *${metadata.subject}*! 👺`, mentions: [num] });
                }
            }
        }
    });

    // --- 5. ANTI-CALL ---
    sock.ev.on('call', async (call) => {
        const db = getDB();
        if (db['global']?.anticall) {
            const caller = call[0].from;
            await sock.updateBlockStatus(caller, "block");
        }
    });

    // --- 6. ANTIDELETE ---
    sock.ev.on('messages.delete', async (item) => {
        const db = getDB();
        if (db[item.remoteJid]?.antidelete) {
            await sock.sendMessage(item.remoteJid, { text: "🕵️‍♂️ *Asura MD detected a deleted message!*" });
        }
    });

}; 
