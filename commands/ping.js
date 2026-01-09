import fs from 'fs';

// Start time
const botStartTime = Date.now();

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const imagePath = './media/thumb.jpg';

    try {
        // 1. React
        await sock.sendMessage(chat, { react: { text: "⚡", key: msg.key } });

        // 2. Animation
        const { key } = await sock.sendMessage(chat, { text: "🚀 Checking System..." });

        const frames = [
            "📶 Analyzing Server...",
            "📡 Calculating Ping.........",
            "⏳ Fetching Uptime...................",
            "👺 Asura MD Engine Ready!"
        ];

        for (let frame of frames) {
            await new Promise(resolve => setTimeout(resolve, 800)); 
            await sock.sendMessage(chat, { text: frame, edit: key });
        }

        // 3. Ping Calculation (മൈനസ് വാല്യൂ വരാതിരിക്കാൻ Math.abs ഉപയോഗിച്ചു)
        const timestamp = msg.messageTimestamp * 1000;
        const ping = Math.abs(Date.now() - timestamp);
        
        // 4. Uptime Calculation
        const uptimeSeconds = Math.floor((Date.now() - botStartTime) / 1000);
        const days = Math.floor(uptimeSeconds / (24 * 3600));
        const hours = Math.floor((uptimeSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        const pingMsg = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 \`👺Asura MD\` 」
*╰────────────❂*
*Hello! I'm Asura MD, your fastest Assistant! ✨*

╭╌❲ *ʙᴏᴛ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ* ❳
╎ ⊙ 𝙱𝚘𝚝 𝚗𝚊𝚖𝚎 : 👺Asura MD
╎ ⊙ 𝙿𝚒𝚗𝚐    : ${ping} 𝚖𝚜
╎ ⊙ 𝚄𝚙𝚝𝚒𝚖𝚎  : ${uptimeString}
╎ ⊙ 𝙾𝚠𝚗𝚎𝚛  : arun.Cumar
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24
> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // 5. ഒറിജിനൽ മെസ്സേജ് അയക്കുന്നു
        if (fs.existsSync(imagePath)) {
            await sock.sendMessage(chat, { 
                image: fs.readFileSync(imagePath), 
                caption: pingMsg 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: pingMsg }, { quoted: msg });
        }

        // 6. എപ്പോഴും വരുന്ന ഗ്രൂപ്പ്/ചാനൽ പരസ്യം
        const groupLink = "https://chat.whatsapp.com/LC3HXrnNI8J0481tjPTbtp";
        const channelLink = "https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24";

        const adMsg = `🏮 *Join our Community:*
Stay updated with Asura MD 

👥 *Group:* ${groupLink}
📢 *Channel:* ${channelLink}

> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        await sock.sendMessage(chat, { 
            text: adMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD COMMUNITY",
                    body: "Click to join for updates! ✨",
                    mediaType: 1,
                    sourceUrl: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24, 
                    showAdAttribution: true,
                    renderLargerThumbnail: false
                }
            }
        });

    } catch (e) {
        console.error("Ping Error:", e);
    }
};
