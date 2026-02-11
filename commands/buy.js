import axios from 'axios';

function clean(text = "") {
    return text.replace(/\s+/g, ' ').trim();
}

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) {
        return sock.sendMessage(chat, { 
            text: "❌ Example: `.Buy iphone 15`" 
        }, { quoted: msg });
    }

    await sock.sendPresenceUpdate('composing', chat);

    try {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(query)}`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        // 🔥 Extract Amazon embedded JSON
        const jsonMatch = data.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);
        if (!jsonMatch) throw new Error("Amazon layout changed");

        const json = JSON.parse(jsonMatch[1]);

        const items = json?.search?.results;
        if (!items || !items.length) throw new Error("No products");

        const product = items.find(p => p.image && p.price);

        const title = clean(product.title);
        const price = product.price?.display || "Price not available";
        const imageUrl = product.image;
        const link = "https://www.amazon.in" + product.url;

        const caption = 
`🛍️ *AMAZON PRODUCT*

📦 *${title}*

💰 *${price}*

🔗 Buy Now:
${link}

> © 👺 Asura MD Shopping`;

        await sock.sendMessage(chat, {
            image: { url: imageUrl },
            caption,
            contextInfo: {
                externalAdReply: {
                    title: title,
                    body: price,
                    mediaType: 1,
                    sourceUrl: link,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "🛒", key: msg.key } });

    } catch (e) {
        console.log("Amazon Error:", e.message);
        await sock.sendMessage(chat, { 
            text: "❌ Product fetch failed. Try different keyword." 
        }, { quoted: msg });
    }
};
