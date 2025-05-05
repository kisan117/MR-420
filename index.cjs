const { default: makeWASocket, useMultiFileAuthState } = require('baileys');
const fs = require('fs');
const readline = require('readline-sync');

async function main() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    const userNumber = readline.question('आपका नंबर: ');
    if (!state.creds.registered) {
        const code = await sock.requestPairingCode(userNumber);
        console.log(`\n👉 Pairing Code: ${code}`);
    }

    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            console.log('✅ Connected!');

            const target = readline.question('Target नंबर: ');
            const name = readline.question('Target नाम: ');
            const delay = parseInt(readline.question('Speed (सेकंड में): ')) * 1000;
            const file = readline.question('Message file नाम: ');

            let message = '';
            try {
                message = fs.readFileSync(file, 'utf-8');
            } catch {
                console.log('❌ फाइल नहीं मिली!');
                return;
            }

            await new Promise(r => setTimeout(r, delay));
            await sock.sendMessage(`${target}@s.whatsapp.net`, { text: `Hi ${name},\n\n${message}` });
            console.log('✅ Message Sent!');
            process.exit(0);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

main();
