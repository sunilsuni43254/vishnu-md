import axios from 'axios';
import * as cheerio from 'cheerio';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const text = args.join(' ');

    if (!text) return sock.sendMessage(chat, { text: "🔍 example: *.Search* Kerala Tourism" }, { quoted: msg });

    try {
        // ഗൂഗിൾ സെർച്ച് റിസൾട്ട് സ്ക്രാപ്പ് ചെയ്യുന്നു
        const url = `https://www.google.com/search?q=${encodeURIComponent(text)}&hl=en`;
        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36'
            }
        });

        const $ = cheerio.load(data);
        let results = [];

        // വെബ്സൈറ്റ് ലിങ്കുകളും വിവരങ്ങളും എടുക്കുന്നു
        $('.tF2Cxc').each((i, el) => {
            const title = $(el).find('h3').text();
            const link = $(el).find('a').attr('href');
            const snippet = $(el).find('.VwiC3b').text();
            if (title && link) {
                results.push({ title, link, snippet });
            }
        });

        // ഗൂഗിൾ ഇമേജുകളിൽ നിന്ന് ഒരു ചിത്രം കണ്ടെത്താൻ ശ്രമിക്കുന്നു
        const imgUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}&tbm=isch&hl=en`;
        const imgData = await axios.get(imgUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $img = cheerio.load(imgData.data);
        // ഗൂഗിൾ ഇമേജ് സ്ക്രാപ്പിംഗ് വഴി കിട്ടുന്ന ആദ്യത്തെ ഇമേജ് ലിങ്ക്
        const firstImage = $img('img').eq(1).attr('src'); 

        if (results.length === 0) {
            return sock.sendMessage(chat, { text: "😁" });
        }

        // മെസ്സേജ് ഫോർമാറ്റ് ചെയ്യുന്നു
        let replyText = `🌟 *ASURA MD SEARCH* 🌟\n\n`;
        results.slice(0, 5).forEach((res, index) => {
            replyText += `*${index + 1}. ${res.title}*\n`;
            replyText += `🔗 _${res.link}_\n`;
            replyText += `📄 ${res.snippet}\n\n`;
        });

        // ചിത്രവും ടെക്സ്റ്റും കൂടി ഒന്നിച്ച് അയക്കുന്നു
        if (firstImage && firstImage.startsWith('http')) {
            await sock.sendMessage(chat, { 
                image: { url: firstImage }, 
                caption: replyText 
            }, { quoted: msg });
        } else {
            // ചിത്രം ലഭിച്ചില്ലെങ്കിൽ ടെക്സ്റ്റ് മാത്രം അയക്കുന്നു
            await sock.sendMessage(chat, { text: replyText }, { quoted: msg });
        }

    } catch (e) {
        console.error("Search Error:", e);
        await sock.sendMessage(chat, { text: "❌ Search process failed!" });
    }
};
