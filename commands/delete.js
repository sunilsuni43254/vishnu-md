export default async (sock, msg) => {
    const quoted = msg.message?.extendedTextMessage?.contextInfo;
    if (!quoted) return;
    await sock.sendMessage(msg.key.remoteJid, { delete: { remoteJid: msg.key.remoteJid, fromMe: false, id: quoted.stanzaId, participant: quoted.participant } });
};
