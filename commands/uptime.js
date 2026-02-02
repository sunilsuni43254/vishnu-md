import fs from 'fs';

const runtime = async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const thumbPath = './media/thumb.jpg';
    const audioPath = './media/song.opus';

    const getUptime = () => {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600).toString().padStart(3, '0');
        const mins = Math.floor((uptime % 3600) / 60).toString().padStart(2, '0');
        const secs = Math.floor(uptime % 60).toString().padStart(2, '0');
        return `${hours}:${mins}:${secs}`;
    };

    // animation 
    const statusIcons = ["✨ Active", "🟢 Online", "⚙️ Running", "🛡️ Secured"];
    const botIcons = ["👺 Asura MD", "👹 ASURA-BOT", "🤖 ASURA-MD WhatsApp Mini Bot", "💀 ASURA-MD v2.0"];

    const getTemplate = (time, iteration) => {
        const sIcon = statusIcons[iteration % statusIcons.length];
        const bIcon = botIcons[iteration % botIcons.length];
        
        return `
*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╭━〔 **ASURA MD** 〕┈⊷
┃ 👤 *Owner:* arun •°cumar
┃ 👺 *Bot:* ${bIcon}
┃ ⏳ *Uptime:* ${time}
┃ ⚙️ *Status:* ${sIcon}
╰━━━━━━━━━━━━┈⊷`.trim();
    };

    try {
        await sock.sendMessage(from, { react: { text: "⏳", key: msg.key } });

        let mainMsg;
        const initialText = getTemplate(getUptime(), 0);

        if (fs.existsSync(thumbPath)) {
            mainMsg = await sock.sendMessage(from, { 
                image: fs.readFileSync(thumbPath), 
                caption: initialText 
            }, { quoted: msg });
        } else {
            mainMsg = await sock.sendMessage(from, { text: initialText }, { quoted: msg });
        }

        if (fs.existsSync(audioPath)) {
            await sock.sendMessage(from, { 
                audio: fs.readFileSync(audioPath), 
                mimetype: 'audio/ogg', 
                ptt: true 
            }, { quoted: msg });
        }

        // 15 തവണ എഡിറ്റ് ചെയ്യും
        for (let i = 1; i <= 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 2000)); 
            const newTime = getUptime();
            
            // പഴയ മെസ്സേജ് എഡിറ്റ് ചെയ്യുന്നു
            await sock.sendMessage(from, { 
                text: getTemplate(newTime, i), 
                edit: mainMsg.key 
            });
        }

    } catch (e) {
        console.error("Runtime Error:", e);
    }
};

export default runtime;
