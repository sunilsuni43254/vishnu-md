import { DisconnectReason } from "@whiskeysockets/baileys";
import fs from "fs";

export const handleConnection = async (sock, startAsura, sessionPath) => {
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // QR Code Alert
        if (qr && !process.env.SESSION_ID) {
            console.log("\x1b[33m⚠️ ASURA-MD: Scan the QR code or add SESSION_ID to Env.\x1b[0m");
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.output?.payload?.message || "Unknown Error";
            
            console.log(`\x1b[31m❌ Connection Closed: ${reason} (Code: ${statusCode})\x1b[0m`);

            // 1. ലോഗൗട്ട് ചെയ്യപ്പെട്ടാൽ സെഷൻ ക്ലിയർ ചെയ്യുക
            if (statusCode === DisconnectReason.loggedOut) {
                console.log("\x1b[41m⚠️ Session Expired. Clearing session folder...\x1b[0m");
                if (fs.existsSync(sessionPath)) {
                    fs.rmSync(sessionPath, { recursive: true, force: true });
                }
                process.exit(1); 
            } 
            
            // 2. Conflict (440) - സിസ്റ്റം ഫ്രഷ് ആയി റീസ്റ്റാർട്ട് ചെയ്യാൻ
            else if (statusCode === 440 || statusCode === DisconnectReason.conflict) {
                console.log("\x1b[35m⚠️ Conflict detected. Restarting for a fresh stream...\x1b[0m");
                process.exit(1); 
            } 
            
            // 3. മറ്റ് താൽക്കാലിക പ്രശ്നങ്ങൾ (Network error etc.)
            else {
                const retryDelay = 5000;
                console.log(`\x1b[33m♻️ Reconnecting in ${retryDelay/1000}s...\x1b[0m`);
                setTimeout(() => startAsura(), retryDelay);
            }

        } else if (connection === 'open') {
            console.log('\x1b[1;32m✅ ASURA MD CONNECTED SUCCESSFULLY!\x1b[0m');

            
            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                const myNumber = sock.user.id.split(':')[0] + "@s.whatsapp.net";
                
                await sock.sendMessage(myNumber, { 
                    text: "👺 *ASURA-MD Status:* Online & Secured! ✅\n\n_Connection logic moved to modular file._" 
                });

                // Auto-join Features
                await sock.newsletterFollow("0029VbB59W9GehENxhoI5l24@newsletter");
                await sock.groupAcceptInvite("JqxtYghmFfR9KGqEwMEa30");

            } catch (e) {
                console.log("Post-connection error (ignored):", e.message);
            }
        }
    });
};
