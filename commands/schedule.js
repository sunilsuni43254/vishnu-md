export default async (sock, msg, args) => {
    const time = parseInt(args[0]);
    const sMsg = args.slice(1).join(' ');
    if (isNaN(time)) return;
    await sock.sendMessage(msg.key.remoteJid, { text: `🕒 Scheduled in ${time} min.` });
    setTimeout(() => { sock.sendMessage(msg.key.remoteJid, { text: `⏰ *REMINDER:* ${sMsg}` }); }, time * 60000);
};
