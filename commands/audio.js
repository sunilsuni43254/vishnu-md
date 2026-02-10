import axios from 'axios';

const getAudio = async (query = '') => {
    try {
        const base = 'https://www.myinstants.com';
        const url = query
            ? `${base}/search/?name=${encodeURIComponent(query)}`
            : `${base}/index/in/`;

        const { data } = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.9'
            }
        });

        // button onclick="play('/media/sounds/xxx.mp3')"
        const regex = /play\('([^']+\.mp3)'\)/g;
        const matches = [...data.matchAll(regex)];

        if (!matches.length) return null;

        const random = matches[Math.floor(Math.random() * matches.length)][1];

        return base + random;
    } catch (err) {
        console.error('Fetch Error:', err.message);
        return null;
    }
};

export default {
    name: 'audio',

    async execute(sock, msg, args) {
        const query = args.join(' ');

        try {
            const audioUrl = await getAudio(query);

            if (!audioUrl) {
                return await sock.sendMessage(
                    msg.key.remoteJid,
                    { text: "❌ not found." },
                    { quoted: msg }
                );
            }

            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false 
                },
                { quoted: msg }
            );

        } catch (err) {
            console.error(err);
            await sock.sendMessage(
                msg.key.remoteJid,
                { text: "❌ Error." },
                { quoted: msg }
            );
        }
    }
};
