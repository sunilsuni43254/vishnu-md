/**
 * 𓆩 👺ASURA MD 𓆪 - ANTI-LINK PRO (ULTRA STRICT)
 * യാതൊരു വിട്ടുവീഴ്ചയും ഇല്ലാതെ എല്ലാ ലിങ്കുകളും ഡിലീറ്റ് ചെയ്യും.
 */

export default async (sock, msg, args) => {
    // ബോട്ട് ഐഡി കൃത്യമായി എടുക്കുന്നു
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!global.antilinkStrictActive) {
        global.antilinkStrictActive = true;

        sock.ev.on('messages.upsert', async (chatUpdate) => {
            try {
                const m = chatUpdate.messages[0];
                
                // ഗ്രൂപ്പുകളിൽ നിന്ന് വരുന്ന മെസ്സേജുകൾ മാത്രം, ബോട്ട് അയക്കുന്നത് ഒഴിവാക്കുന്നു
                if (!m.message || m.key.fromMe || !m.key.remoteJid.endsWith('@g.us')) return;

                const chatJid = m.key.remoteJid;
                const senderJid = m.key.participant || m.key.remoteJid;

                // 1. എല്ലാ മെസ്സേജ് ടൈപ്പുകളിൽ നിന്നും ലിങ്ക് തിരയുന്നു (Text, Caption, Button text etc.)
                const text = m.message.conversation || 
                             m.message.extendedTextMessage?.text || 
                             m.message.imageMessage?.caption || 
                             m.message.videoMessage?.caption || 
                             m.message.templateButtonReplyMessage?.selectedId || 
                             m.message.buttonsResponseMessage?.selectedButtonId || 
                             "";

                // 2. ഏറ്റവും പവർഫുൾ ആയ ലിങ്ക് ഫൈൻഡർ (Regex)
                // ഇതിൽ .com, .in, .me, wa.me, t.me തുടങ്ങി എല്ലാം ഉൾപ്പെടും
                const linkRegex = /((https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?)|(wa\.me\/[0-9]+)|(t\.me\/[a-zA-Z0-9_]+)/gi;
                
                const hasLink = linkRegex.test(text);

                if (hasLink) {
                    const groupMetadata = await sock.groupMetadata(chatJid);
                    const participants = groupMetadata.participants;
                    
                    // ബോട്ട് അഡ്മിൻ ആണോ എന്ന് പരിശോധിക്കുന്നു
                    const botAdmin = participants.find(p => p.id === botId)?.admin;
                    
                    // അയച്ച ആൾ അഡ്മിൻ ആണോ എന്ന് നോക്കുന്നു
                    const isSenderAdmin = participants.find(p => p.id === senderJid)?.admin;

                    // ബോട്ട് അഡ്മിൻ ആണെങ്കിൽ മാത്രം ഡിലീറ്റ് ചെയ്യും, അഡ്മിൻമാർ അയക്കുന്ന ലിങ്ക് ഒഴിവാക്കും
                    if (botAdmin && !isSenderAdmin) {
                        await sock.sendMessage(chatJid, { 
                            delete: { 
                                remoteJid: chatJid, 
                                fromMe: false, 
                                id: m.key.id, 
                                participant: senderJid 
                            } 
                        });
                        
                        // സൈലന്റ് ആയിരിക്കണം എന്ന് പറഞ്ഞതുകൊണ്ട് വോണിംഗ് മെസ്സേജ് ഒഴിവാക്കി
                    }
                }
            } catch (error) {
                // ലോജിക് തടസ്സപ്പെടാതിരിക്കാൻ എറർ ഇഗ്നോർ ചെയ്യുന്നു
            }
        });
    }
};
