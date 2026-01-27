export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // 1. Validation: Check if time and message are provided
    const minutes = parseInt(args[0]);
    const messageContent = args.slice(1).join(' ');

    if (isNaN(minutes) || minutes <= 0) {
        return sock.sendMessage(chat, { 
            text: "⚠️ *Invalid Duration*\n\nPlease specify the time in minutes.\nExample: `.schedule 5 Meeting starting now`" 
        }, { quoted: msg });
    }

    if (!messageContent) {
        return sock.sendMessage(chat, { 
            text: "⚠️ *Missing Content*\n\nPlease provide the message you want to schedule." 
        }, { quoted: msg });
    }

    // 2. Success Confirmation (Professional Look)
    const confirmationText = `📅 *Task Scheduled Successfully*\n\n` +
                             `🕒 *Duration:* ${minutes} Minute(s)\n` +
                             `📝 *Content:* ${messageContent}\n\n` +
                             `_I will notify you when the timer expires._`;

    await sock.sendMessage(chat, { text: confirmationText }, { quoted: msg });

    // 3. The Timer Logic
    setTimeout(async () => {
        const reminderText = `⏰ *REMINDER ALERT*\n\n` +
                             `Dear User, your scheduled notification is here:\n` +
                             `> ${messageContent}`;

        await sock.sendMessage(chat, { 
            text: reminderText,
            contextInfo: { 
                externalAdReply: {
                    title: "Asura MD Scheduler",
                    body: "Time's Up!",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        });
    }, minutes * 60000);
};
