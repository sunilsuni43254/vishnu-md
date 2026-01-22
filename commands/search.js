import wiki from 'wikipedia';

export default async (sock, msg, args) => {
    const chat = msg.key.remoteJid;
    const query = args.join(' ');

    if (!query) return sock.sendMessage(chat, { text: "🔍 എന്താണ് തിരയേണ്ടത്?\nExample: *.Search Kerala*" }, { quoted: msg });

    try {
        // വിക്കിപീഡിയയിൽ തിരയുന്നു
        const page = await wiki.page(query);
        
        // ആ വിഷയത്തിന്റെ ചുരുക്കരൂപം (Summary) എടുക്കുന്നു
        const summary = await page.summary();

        let wikiText = `📚 *ASURA MD Searching Engine* 📚\n\n`;
        wikiText += `✨ *Title:* ${summary.title}\n`;
        wikiText += `📝 *Description:* ${summary.description || 'No description available'}\n\n`;
        wikiText += `📖 *Summary:* ${summary.extract}\n\n`;
        wikiText += `_Source: Wikipedia_`;

        // ചിത്രം ഉണ്ടെങ്കിൽ ചിത്രത്തോടൊപ്പം അയക്കുന്നു, ഇല്ലെങ്കിൽ ടെക്സ്റ്റ് മാത്രം
        if (summary.thumbnail && summary.thumbnail.source) {
            await sock.sendMessage(chat, { 
                image: { url: summary.thumbnail.source }, 
                caption: wikiText 
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chat, { text: wikiText }, { quoted: msg });
        }

    } catch (e) {
        console.error("Wiki Error:", e);
        await sock.sendMessage(chat, { text: "❌ ക്ഷമിക്കണം, വിവരങ്ങൾ കണ്ടെത്താനായില്ല!" });
    }
};
