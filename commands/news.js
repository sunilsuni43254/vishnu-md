import axios from 'axios';

function extract(tag, text) {
    return text.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`))?.[1] || "";
}

function clean(txt = "") {
    return txt
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    await sock.sendPresenceUpdate('composing', chat);

    try {
        const query = args.length ? args.join(' ') : 'India';
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const { data } = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });

        const items = data.match(/<item>([\s\S]*?)<\/item>/g);
        if (!items) {
            return sock.sendMessage(chat, { text: `❌ No news for ${query}` }, { quoted: msg });
        }

        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];

            let title = clean(extract('title', item).split(' - ')[0]);
            let link = extract('link', item);
            let source = clean(extract('source', item));
            let pubDate = extract('pubDate', item);
            let description = clean(extract('description', item));

            // 🖼️ image from media tags
            let image =
                item.match(/<media:content[^>]*url="([^"]+)"/)?.[1] ||
                item.match(/<media:thumbnail[^>]*url="([^"]+)"/)?.[1] ||
                null;

            const caption =
`📰 *${title}*

🗞 _${source}_
🕒 ${new Date(pubDate).toLocaleString()}

📄 ${description}

🔗 Read more:
${link}

> © 👺 Asura MD News`;

            if (image) {
                await sock.sendMessage(chat, {
                    image: { url: image },
                    caption
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chat, { text: caption }, { quoted: msg });
            }
        }

        await sock.sendMessage(chat, { react: { text: "📰", key: msg.key } });

    } catch (e) {
        console.log(e);
        await sock.sendMessage(chat, { text: "❌ News fetch failed. Try later." }, { quoted: msg });
    }
};
