const { default: makeWASocket, useMultiFileAuthState } = require('baileys');
const fs = require('fs');
const readline = require('readline-sync');

async function start() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
    });

    const number = readline.question('✅ अपना WhatsApp नंबर डालो (91xxxxxxxxxx): ');

    if (!state.creds.registered) {
        const code = await sock.requestPairingCode(number);
        console.log(`\n🟢 Pairing Code: ${code}`);
        console.log('QR नहीं, ये code अपने WhatsApp में डालो!');
    }

    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            console.log('✅ WhatsApp से Connected हो गया भाई!');

            const target = readline.question('🎯 Target नंबर: ');
            const name = readline.question('🔤 Target नाम: ');
            const delay = parseInt(readline.question('⏱️ Speed (सेकंड): ')) * 1000;
            const file = readline.question('📝 Message File नाम (example.txt): ');

            let message = '';
            try {
                message = fs.readFileSync(file, 'utf-8');
            } catch {
                console.log('❌ Message File नहीं मिली!');
                return;
            }

            console.log(`\n🚀 Auto-messaging शुरू हो रहा है हर ${delay / 1000} सेकंड में...`);

            setInterval(async () => {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { text: `Hi ${name},\n\n${message}` });
                console.log(`✅ Message भेजा गया: ${target}`);
            }, delay);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

start();
