export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    let user = quoted?.participant || quoted?.mentionedJid?.[0];
    if (!user) return;
    await sock.groupParticipantsUpdate(chat, [user], "demote");
    await sock.sendMessage(chat, { text: "✅ Demoted!" });
};
