import fs from 'fs';
import path from 'path';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.remoteJid;
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    
    // ബോട്ട് ഓണർ ആണോ എന്ന് പരിശോധിക്കുന്നു
    const isOwner = botId.includes(sender.split('@')[0]);
    if (!isOwner) return;

    const mtype = Object.keys(msg.message)[0];
    const body = mtype === 'conversation' ? msg.message.conversation :
                 mtype === 'extendedTextMessage' ? msg.message.extendedTextMessage.text :
                 mtype === 'imageMessage' ? msg.message.imageMessage.caption :
                 mtype === 'videoMessage' ? msg.message.videoMessage.caption : '';

    const command = body.slice(1).trim().split(/ +/)[0].toLowerCase();
    const imagePath = './media/thumb.jpg';

    // ഡാറ്റാബേസ് സെറ്റപ്പ്
    if (!global.db) global.db = { settings: { mode: 'public' } };

    let statusText = "";
    if (command === 'public') {
        global.db.settings.mode = 'public';
        statusText = "🌐 *BOT MODE: PUBLIC*";
    } else if (command === 'private') {
        global.db.settings.mode = 'private';
        statusText = "🔒 *BOT MODE: PRIVATE*";
    } else {
        return; // മറ്റ് കമാൻഡുകൾ ആണെങ്കിൽ ഒന്നും ചെയ്യണ്ട
    }

    // ഡിസൈൻ ടെക്സ്റ്റ്
    const design = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╔━━━━━━━━━━❥❥❥
┃ °☆°☆°☆°☆°☆°☆°☆°☆°
┃  ${statusText}
╠━━━━⛥❖⛥━━━❥❥❥
╚━━━━⛥❖⛥━━━❥❥❥

> *✅Select a command from the list above and type it with a dot.*

© 👺 𝐴𝑠𝑢𝑟𝑎 𝑀𝐷 ᴍɪɴɪ ʙᴏᴛ
𝑠ɪᴍᴘʟᴇ ᴡᴀʙᴏᴛ ᴍᴀᴅᴇ ʙʏ 𝑎𝑟𝑢𝑛.𝑐𝑢𝑚𝑎𝑟 ヅ
> 📢 Join our channel: https://whatsapp.com/channel/0029VbB59W9GehENxhoI5l24`;

    // മെസ്സേജ് അയക്കുന്നു
    if (fs.existsSync(imagePath)) {
        await sock.sendMessage(chat, { 
            image: fs.readFileSync(imagePath), 
            caption: design 
        }, { quoted: msg });
    } else {
        await sock.sendMessage(chat, { text: design }, { quoted: msg });
    }
};
