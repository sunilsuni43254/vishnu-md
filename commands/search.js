import axios from 'axios';

export default async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(from, { text: "🏮 *ASURA SEARCH*\nWhat do you want to know?" });

    try {
        await sock.sendMessage(from, { react: { text: "🔍", key: msg.key } });

        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;
        const response = await axios.get(url);
        const data = response.data;

        // DuckDuckGo മറുപടി നൽകുന്നത് 'AbstractText' എന്നതിലാണ്
        if (data.AbstractText) {
            const searchMsg = `
╭━━〔 🥰 *ASURA MD SEARCH* 〕━━┈⊷
┃
┃ 🔎 *Query:* ${data.Heading}
┃
┣━━━━━━━━━━━━━━┈⊷
┃
${data.AbstractText}
┃
┣━━━━━━━━━━━━━━┈⊷
┃ 📚 *Source:* ${data.AbstractSource || 'Asura-MD}
╰━━━━━━━━━━━━━━━┈⊷
> *© 2026 ASURA MD*`;

            // ഇമേജ് ഉണ്ടെങ്കിൽ അത് ഉൾപ്പെടുത്തുന്നു
            if (data.Image) {
                await sock.sendMessage(from, { 
                    image: { url: `https://duckduckgo.com${data.Image}` }, 
                    caption: searchMsg 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(from, { text: searchMsg }, { quoted: msg });
            }
            
            await sock.sendMessage(from, { react: { text: "✅", key: msg.key } });

        } else {
            // മറുപടി ഇല്ലെങ്കിൽ
            await sock.sendMessage(from, { 
                text: "❌ *No direct info found!* Try searching for famous people, places, or things." 
            }, { quoted: msg });
        }

    } catch (error) {
        console.error('DDG Error:', error);
        await sock.sendMessage(from, { text: "⚠️ Connection Error! Try again later." });
    }
};
