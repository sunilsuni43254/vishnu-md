import yts from "yt-search";
import { exec } from "child_process";
import fs from "fs";

export default async (sock, msg, args) => {
  const chat = msg.key.remoteJid;
  const searchText = args.join(" ");

  if (!searchText) {
    return sock.sendMessage(chat, { text: "Usage: .video <name or link>" });
  }

  try {
    const search = await yts(searchText);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(chat, { text: "Video Not Found 😢" });
    }

    const videoUrl = video.url;
    const title = video.title;

    // ലോക്കൽ തംബ്‌നെയിൽ പാത്ത്
    const thumbPath = "./media/thumb.jpg";
    const imageContent = fs.existsSync(thumbPath) ? fs.readFileSync(thumbPath) : { url: video.thumbnail };

    // ഡിസൈൻ ക്യാപ്ഷൻ
    const captionText = `*👺⃝⃘̉̉━━━━━━━━━━━◆◆◆*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☪︎⋆*
*⊹* 🪔 *Video Download*
*✧* 「 \`👺Asura MD\` 」
*╰─────────────────❂*
╭•°•❲ *Downloading...* ❳•°•
 ⊙🎬 *TITLE:* ${title}
*◀︎ •၊၊||၊||||။‌‌‌‌၊||••*
╰╌╌╌╌╌╌╌╌╌╌╌╌࿐`;

    // 1. തംബ്‌നെയിൽ അയക്കുന്നു
    await sock.sendMessage(chat, { image: imageContent, caption: captionText });

    // 2. താൽക്കാലികമായി ഫയൽ സേവ് ചെയ്യാൻ ഒരു പേര് നൽകുന്നു
    const fileName = `./media/temp_${Date.now()}.mp4`;

    // 3. yt-dlp ഉപയോഗിച്ച് വീഡിയോ ഡൗൺലോഡ് ചെയ്യുന്നു (480p quality)
    exec(`yt-dlp -f "best[ext=mp4][height<=480]" "${videoUrl}" -o "${fileName}"`, async (error) => {
      if (error) {
        console.error("Download Error:", error);
        return sock.sendMessage(chat, { text: "Error ❌" });
      }

      // 4. വീഡിയോ അയക്കുന്നു
      if (fs.existsSync(fileName)) {
        await sock.sendMessage(chat, {
          video: fs.readFileSync(fileName),
          mimetype: 'video/mp4',
          caption: `*${title}*`
        }, { quoted: msg });

        // 5. അയച്ചതിന് ശേഷം ഫയൽ ഡിലീറ്റ് ചെയ്യുന്നു (Storage ലാഭിക്കാൻ)
        fs.unlinkSync(fileName);
      }
    });

  } catch (err) {
    console.error("Main Error:", err);
    sock.sendMessage(chat, { text: "😢" });
  }
};
