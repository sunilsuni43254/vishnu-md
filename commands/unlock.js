export default async (sock, msg) => {
    await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement');
    await sock.sendMessage(msg.key.remoteJid, { text: "🔓 Group Unlocked (All Members)." });
};
