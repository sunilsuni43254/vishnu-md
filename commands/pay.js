export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const amount = args[0] || "10";
    const myUpi = "08arun7@upi"; 

    try {
        await sock.sendMessage(from, { react: { text: "💰", key: msg.key } });

        const donateText = `
*─『 💳 ASURA MD PAY 』─*
*Hello,* @${msg.pushName || 'User'}
*Support the development of Asura MD.*

*DETAILS*
━━━━━━━━━━━━━━━━━
⊙ *Payee:* arun•°Cumar
⊙ *Amount:* ₹${amount}.00
⊙ *UPI:* \`${myUpi}\`
━━━━━━━━━━━━━━━━━

🥰🥰🥰`;

        // Native Flow Buttons (Modern & Stable)
        const message = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: "⚡ *QUICK PAYMENT*" },
                        body: { text: donateText },
                        footer: { text: "© ᴀsᴜʀᴀ ᴍᴅ | ᴀʀᴜɴ" },
                        nativeFlowMessage: {
                            buttons: [
                                {
                                    "name": "cta_url",
                                    "buttonParamsJson": `{"display_text":"💸 PAY NOW","url":"https://pay.upilink.in/pay/${myUpi}?am=${amount}","merchant_url":"https://pay.upilink.in/pay/${myUpi}?am=${amount}"}`
                                },
                                {
                                    "name": "quick_reply",
                                    "buttonParamsJson": `{"display_text":"👤 OWNER","id":"!owner"}`
                                },
                                {
                                    "name": "quick_reply",
                                    "buttonParamsJson": `{"display_text":"❓ HELP","id":"!help"}`
                                }
                            ]
                        },
                        contextInfo: {
                            mentionedJid: [msg.sender],
                            forwardingScore: 999,
                            isForwarded: true
                        }
                    }
                }
            }
        };

        await sock.relayMessage(from, message, {});

    } catch (e) {
        console.error('Donate Error:', e);
        await sock.sendMessage(from, { text: `Pay via UPI: ${myUpi}` }, { quoted: msg });
    }
};
