import https from 'https';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ') || 'headphones';

    await sock.sendPresenceUpdate('composing', chat);

    // eBay official RSS search
    const url = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_rss=1`;

    https.get(url, (res) => {
        let data = '';

        res.on('data', chunk => data += chunk);

        res.on('end', async () => {
            try {
                const items = data.match(/<item>([\s\S]*?)<\/item>/g);

                if (!items) {
                    return sock.sendMessage(chat, { text: "❌ No products found." }, { quoted: msg });
                }

                let text = `🛍️ *BEST PRODUCTS FOR:* _${query}_\n\n`;

                for (let i = 0; i < Math.min(2, items.length); i++) {
                    const item = items[i];

                    const title = item.match(/<title>(.*?)<\/title>/)?.[1];
                    const link = item.match(/<link>(.*?)<\/link>/)?.[1];
                    const price = item.match(/<g:price>(.*?)<\/g:price>/)?.[1] || "Check site";
                    const img = item.match(/<media:content url="(.*?)"/)?.[1];

                    text += `*${i + 1}. ${title}*\n`;
                    text += `💰 Price: ${price}\n`;
                    text += `🔗 ${link}\n\n`;

                    // First item image thumbnail preview
                    if (i === 0 && img) {
                        await sock.sendMessage(chat, {
                            image: { url: img },
                            caption: text
                        }, { quoted: msg });

                        return;
                    }
                }

                await sock.sendMessage(chat, { text }, { quoted: msg });

            } catch (err) {
                sock.sendMessage(chat, { text: "❌ Error parsing products." }, { quoted: msg });
            }
        });

    }).on('error', () => {
        sock.sendMessage(chat, { text: "❌ RSS Server error." }, { quoted: msg });
    });
};
