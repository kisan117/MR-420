const { makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const readline = require('readline-sync');
const fs = require('fs');

// 1. User से उसका नंबर लें
const userNumber = readline.question('अपना WhatsApp नंबर डालें (country code सहित, जैसे 919876543210): ');
console.log(`आपका नंबर: ${userNumber}`);

// 2. Pairing Code दिखाएँ और नोटिफिकेशन दें
const { state, saveState } = useSingleFileAuthState('./auth_info.json'); // Corrected the file name to avoid confusion
const sock = makeWASocket({ auth: state, printQRInTerminal: false });

async function startBot() {
    if (!state.creds.registered) {
        const code = await sock.requestPairingCode(userNumber);
        console.log('\n🔔 अपने WhatsApp में जाएँ:');
        console.log('Settings > Linked Devices > Link a device > Link with phone number');
        console.log(`\n👉 वहाँ यह कोड डालें: ${code}\n`);
        console.log('⏳ पेयरिंग पूरी होने तक इंतजार करें...\n');
    }

    // 3. पेयरिंग के बाद Target details पूछें
    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            console.log('✅ WhatsApp से कनेक्ट हो गया!\n');

            // Target details लें
            const targetNumber = readline.question('Target नंबर (country code सहित, जैसे 919xxxxxxxxx): ');
            const targetName = readline.question('Target नाम: ');
            const speed = parseInt(readline.question('Speed (सेकंड में डिले): ')) * 1000;
            const msgFile = readline.question('Message file name (जैसे message.txt): ');

            // मैसेज फाइल पढ़ें
            let messageText = '';
            try {
                messageText = fs.readFileSync(msgFile, 'utf-8');
            } catch (e) {
                console.log('❌ मैसेज फाइल नहीं मिली!');
                process.exit(1);
            }

            // Target को मैसेज भेजें
            await new Promise(resolve => setTimeout(resolve, speed));
            await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                text: `नमस्ते ${targetName},\n\n${messageText}`
            });
            console.log('✅ मैसेज भेज दिया गया!');
            process.exit(0);
        }
    });
}

startBot();
