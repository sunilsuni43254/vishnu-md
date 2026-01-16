export default async (sock, msg, args) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // ബാക്ക്ഗ്രൗണ്ട് ലിസണർ ഒരു തവണ മാത്രം സെറ്റ് ചെയ്യുന്നു
    if (!global.silentAntilinkActive) {
        global.silentAntilinkActive = true;

        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                
                // ഗ്രൂപ്പ് മെസ്സേജുകൾ മാത്രം ശ്രദ്ധിക്കുന്നു, ബോട്ട് അയക്കുന്നവ ഒഴിവാക്കുന്നു
                if (!m.message || m.key.fromMe || !m.key.remoteJid.endsWith('@g.us')) return;

                // ലിങ്ക് കണ്ടെത്താനുള്ള പാറ്റേൺ
                const text = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || m.message.videoMessage?.caption || "";
                const containsLink = /(https?:\/\/[^\s]+|www\.[^\s]+|wa\.me\/[^\s]+|t\.me\/[^\s]+)/gi.test(text);

                if (containsLink) {
                    const chatJid = m.key.remoteJid;
                    const groupMetadata = await sock.groupMetadata(chatJid);
                    const participants = groupMetadata.participants;
                    
                    // ബോട്ട് അഡ്മിൻ ആണോ എന്ന് നോക്കുന്നു (ഡിലീറ്റ് ചെയ്യാൻ ഇത് നിർബന്ധമാണ്)
                    const botAdmin = participants.find(p => p.id === botId)?.admin;
                    if (!botAdmin) return;

                    // അയച്ച ആൾ അഡ്മിൻ ആണോ എന്ന് നോക്കുന്നു (അഡ്മിൻമാരെ ഒഴിവാക്കുന്നു)
                    const senderJid = m.key.participant || m.key.remoteJid;
                    const isSenderAdmin = participants.find(p => p.id === senderJid)?.admin;

                    if (!isSenderAdmin) {
                        // 🤫 SILENT DELETE (മുന്നറിയിപ്പ് സന്ദേശങ്ങൾ ഒന്നുമില്ലാതെ ഡിലീറ്റ് ചെയ്യുന്നു)
                        await sock.sendMessage(chatJid, { 
                            delete: { 
                                remoteJid: chatJid, 
                                fromMe: false, 
                                id: m.key.id, 
                                participant: senderJid 
                            } 
                        });
                    }
                }
            } catch (error) {
                
            }
        });
    }
};
