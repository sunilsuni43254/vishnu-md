import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const DB_PATH = './media/asura_db.json';
const genAI = new GoogleGenerativeAI("AIzaSyAjdhkNjek2l9VCm6N9upQ5L1WuZvb-CC4"); 

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a close, helpful friend named Asura MD. Your tone is casual, supportive, and witty. Answer in the same language the user speaks to you (multilingual). Use emojis occasionally to feel more human. Don't be too formal like a robot; talk like a real buddy."
});

const getDB = () => {
    if (!fs.existsSync('./media')) fs.mkdirSync('./media');
    return fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : {};
};

export const handleEvents = async (sock) => {
    sock.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const msg = chatUpdate.messages[0];
            if (!msg.message || msg.key.fromMe) return;

            const chat = msg.key.remoteJid;
            const body = (msg.message.conversation || msg.message.extendedTextMessage?.text || "").trim();
            const db = getDB();

            // --- 1. CHATBOT TIMER CONTROL ---
            // .chatbot off എന്ന് കൊടുത്താൽ ഓഫ് ചെയ്യാനുള്ള ഓപ്ഷൻ കൂടി ചേർത്തു
            if (body.startsWith('.chatbot')) {
                const args = body.split(" ");
                
                if (args[1] === 'off') {
                    delete db[chat];
                    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
                    return sock.sendMessage(chat, { text: "✅ Chatbot turned OFF." });
                }

                const mins = parseInt(args[1]);
                if (isNaN(mins)) {
                    return sock.sendMessage(chat, { text: "❌ *Format:* .chatbot [mins] or .chatbot off" });
                }

                const expiryTime = Date.now() + (mins * 60 * 1000);
                db[chat] = { expiry: expiryTime };
                fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

                return sock.sendMessage(chat, { text: `✅ Asura MD AI activated for *${mins}* minutes! 👺🤖` });
            }

            // --- 2. AI LOGIC ---
            const chatConfig = db[chat];
            if (chatConfig && chatConfig.expiry) {
                if (Date.now() < chatConfig.expiry) {
                    if (body.startsWith('.') || body.startsWith('!')) return;

                    await sock.sendPresenceUpdate('composing', chat);
                    const result = await model.generateContent(body);
                    const aiText = result.response.text();

                    await sock.sendMessage(chat, { text: aiText }, { quoted: msg });
                } else {
                    delete db[chat];
                    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
                }
            }
        } catch (e) {
            console.error("Bot Error:", e);
        }
    });
};
