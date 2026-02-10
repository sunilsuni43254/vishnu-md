import axios from 'axios';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    
    // ടൈപ്പിംഗ് സ്റ്റാറ്റസ്
    await sock.sendPresenceUpdate('composing', chat);

    try {
        const query = args.length > 0 ? args.join(' ') : 'India';
        
        // Google News-ന് പകരം മറ്റൊരു Open Source RSS ഫീഡ് രീതി പരീക്ഷിക്കുന്നു
        // ഇത് കൂടുതൽ സ്റ്റേബിൾ ആണ്
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                'Accept': 'application/xml, text/xml, */*'
            },
            timeout: 5000 // 5 സെക്കൻഡിനുള്ളിൽ റെസ്പോൺസ് വന്നില്ലെങ്കിൽ എറർ കാണിക്കും
        });

        const data = response.data;

        // <item> ടാഗുകൾ വേർതിരിക്കുന്നു
        const items = data.match(/<item>([\s\S]*?)<\/item>/g);
        
        if (!items || items.length === 0) {
            return await sock.sendMessage(chat, { text: `❌ No news found for: ${query}. Try a different keyword.` }, { quoted: msg });
        }

        let newsMsg = `*📰 LATEST NEWS: ${query.toUpperCase()}*\n\n`;

        // ആദ്യത്തെ 5 വാർത്തകൾ
        for (let i = 0; i < Math.min(items.length, 5); i++) {
            const item = items[i];
            
            let title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1] || "No Title";
            let link = item.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
            let source = item.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1] || "Breaking News";

            // Title-ലെ അനവശ്യമായ ഉറവിടം (Source) ഒഴിവാക്കുന്നു (ഉദാ: - Times of India)
            title = title.split(' - ')[0];

            // HTML Entities ക്ലീൻ ചെയ്യുന്നു
            title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

            newsMsg += `*${i + 1}. ${title}*\n`;
            newsMsg += `📍 _Source: ${source}_\n`;
            newsMsg += `🔗 ${link}\n\n`;
        }

        newsMsg += `> *© ᴄʀᴇᴀᴛᴇᴅ ʙʏ 👺Asura MD*`;

        // റെസ്പോൺസ് അയക്കുന്നു
        await sock.sendMessage(chat, { 
            text: newsMsg,
            contextInfo: {
                externalAdReply: {
                    title: "👺 ASURA MD NEWS UPDATES",
                    body: `Trending stories about ${query}`,
                    thumbnailUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_p6vP_P351_e3O8D77I3uT8v9vO7W_6vO8g&s", // ഒരു ന്യൂസ് ഐക്കൺ
                    mediaType: 1,
                    sourceUrl: "https://news.google.com", 
                    showAdAttribution: false,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: msg });

        await sock.sendMessage(chat, { react: { text: "📰", key: msg.key } });

    } catch (e) {
        console.error("News Error:", e.message);
        await sock.sendMessage(chat, { text: "❌ News Server is busy. Please try again in a moment." }, { quoted: msg });
    }
};
