import fs from 'fs';

export default {
  name: "track",
  alias: ["trace", "fullinfo"],
  desc: "Deep tracking of any global number",
  usage: ".search 919876543210",
  category: "utility",

  async execute(sock, msg, args) {
    const from = msg.key.remoteJid;
    try {
      let input = args.join("").replace(/[^0-9]/g, "");
      if (!input || input.length < 7) {
        return sock.sendMessage(from, { text: "❌ *Error:* Please provide a valid number with country code." });
      }

      // --- DATABASE ---
      const countryBase = {
        "1": { n:"USA/Canada", i:"US", c:"Washington D.C.", r:"North America", cu:"USD", sy:"$", t:"-5 to -8", l:"English", d:"Right", cd:"1", p:"1", tl:".us", pc:"20001", pop:"331M", call:"1", em:"911", ar:"9.8M km²", bw:"EST/PST" },
        "7": { n:"Russia", i:"RU", c:"Moscow", r:"Europe/Asia", cu:"RUB", sy:"₽", t:"+3 to +12", l:"Russian", d:"Right", cd:"7", p:"8", tl:".ru", pc:"101000", pop:"146M", call:"8", em:"112", ar:"17M km²", bw:"MSK" },
        "20": { n:"Egypt", i:"EG", c:"Cairo", r:"Africa", cu:"EGP", sy:"£", t:"+2:00", l:"Arabic", d:"Right", cd:"20", p:"0", tl:".eg", pc:"11511", pop:"109M", call:"0", em:"122", ar:"1M km²", bw:"EET" },
        "91": { n:"India", i:"IN", c:"New Delhi", r:"South Asia", cu:"INR", sy:"₹", t:"+5:30", l:"Hindi/English", d:"Left", cd:"91", p:"0", tl:".in", pc:"110001", pop:"1.4B", call:"0", em:"112", ar:"3.2M km²", bw:"IST" },
        "971": { n:"UAE", i:"AE", c:"Abu Dhabi", r:"Middle East", cu:"AED", sy:"د.إ", t:"+4:00", l:"Arabic", d:"Right", cd:"971", p:"0", tl:".ae", pc:"00000", pop:"9.8M", call:"00", em:"999", ar:"83k km²", bw:"GST" }
        // (നിങ്ങളുടെ ബാക്കി ലിസ്റ്റ് ഇവിടെ ചേർക്കാം)
      };

      let matched = "";
      for (let code of Object.keys(countryBase).sort((a, b) => b.length - a.length)) {
        if (input.startsWith(code)) { matched = code; break; }
      }

      const db = countryBase[matched] || { n: "Global", i: "XX", c: "Unknown", r: "Unknown", cu: "N/A", sy: "N/A", t: "N/A", l: "N/A", d: "N/A", cd: matched || "N/A", p: "N/A", tl: ".com", pc: "N/A", pop: "N/A", call: "N/A", em: "N/A", ar: "N/A", bw: "N/A" };
      
      const now = new Date();
      const reportID = `ASR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const mapLink = `https://www.google.com/maps/search/${encodeURIComponent(db.c + "+" + db.n)}`;

      const report = `*👺⃝⃘̉̉̉━━━━━━━━━◆◆◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *ᴡʜᴀᴛꜱᴀᴘᴘ ᴍɪɴɪ ʙᴏᴛ*
*✧* 「 👺Asura MD 」
*╰────────────❂*
╭━━━〔 👹 *ASURA INTELLIGENCE REPORT* 〕━━━┈⊷
┃
┃ 📂 *GENERAL FILE INFO*
┃ 🆔 *Ref ID:* ${reportID}
┃ 📱 *Target:* +${input}
┃ 📡 *Network:* ${input.length > 10 ? 'Cellular (LTE/5G)' : 'PSTN/Fixed'}
┃ 🛰️ *Signal:* Global Encrypted
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🌍 *GEOGRAPHICAL DATA (30+ Info)*
┃ 📍 *Country:* ${db.n} (${db.i})
┃ 🏛️ *Capital:* ${db.c}
┃ 🗺️ *Region:* ${db.r}
┃ 🌐 *Map View:* ${mapLink}
┃ 🛣️ *Drive Side:* ${db.d}
┃ 📏 *Area:* ${db.ar}
┃ 👥 *Population:* ${db.pop}
┃ 📧 *Zip Code:* ${db.pc}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ ⚙️ *TECHNICAL SPECS (40+ Info)*
┃ 🔢 *Country Code:* +${db.cd}
┃ ☎️ *Dial Code:* ${db.p}
┃ 📶 *Prefix:* ${input.substring(0, 5)}
┃ 💻 *TLD:* ${db.tl}
┃ 💱 *Currency:* ${db.cu} (${db.sy})
┃ 🗣️ *Official Lang:* ${db.l}
┃ 🚨 *Emergency:* ${db.em}
┃ 📡 *Call Type:* ${db.call === '0' ? 'Direct' : 'Inter-Exit'}
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🔐 *SECURITY & LOGS (30+ Info)*
┃ 🕒 *Timezone:* ${db.t} (${db.bw})
┃ 📅 *Fetch Date:* ${now.toLocaleDateString()}
┃ ⌚ *Fetch Time:* ${now.toLocaleTimeString()}
┃ 🛡️ *Verification:* SSL Secured
┃ 🕵️ *Status:* Active / Traced
┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
┃ 🔗 *INTELLIGENCE LINKS*
┃ 🟢 *WhatsApp:* wa.me/${input}
┃ 🗺️ *Live Map:* ${mapLink}
┃
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┈⊷
> *©  ASURA-MD - GLOBAL INTEL*`;

      const thumbPath = './media/asura.jpg';
      const thumbBuffer = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : null;

      await sock.sendMessage(from, { 
        text: report,
        contextInfo: {
          externalAdReply: {
            title: "ASURA GLOBAL DATA ANALYTICS",
            body: `TRACING: +${input} [SUCCESS]`,
            mediaType: 1,
            thumbnail: thumbBuffer,
            sourceUrl: `https://wa.me/${input}`,
            showAdAttribution: false,
            renderLargerThumbnail: true
          }
        }
      }, { quoted: msg });

    } catch (e) {
      console.error(e);
      await sock.sendMessage(from, { text: "❌ *Trace Failed:* Data Corrupted." });
    }
  }
};
