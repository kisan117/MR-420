const { makeWASocket, useSingleFileAuthState } = require('baileys'); // @whiskeysockets/baileys ko replace karke 'baileys' ka use karo
const readline = require('readline-sync');
const fs = require('fs');

// 1. User se uska number lein
const userNumber = readline.question('अपना WhatsApp नंबर डालें (country code सहित, जैसे 919876543210): ');
console.log(`आपका नंबर: ${userNumber}`);

// 2. Pairing Code dikhayein aur notification dein
const { state, saveState } = useSingleFileAuthState('./auth.json'); // Auth state file
const sock = makeWASocket({ auth: state, printQRInTerminal: false });

async function startBot() {
    if (!state.creds.registered) {
        const code = await sock.requestPairingCode(userNumber);
        console.log('\n🔔 अपने WhatsApp में जाएं:');
        console.log('Settings > Linked Devices > Link a device > Link with phone number');
        console.log(`\n👉 वहाँ यह कोड डालें: ${code}\n`);
        console.log('⏳ पेयरिंग पूरी होने तक इंतजार करें...\n');
    }

    // 3. Pairing ke baad Target details poochhein
    sock.ev.on('connection.update', async (update) => {
        if (update.connection === 'open') {
            console.log('✅ WhatsApp se connect ho gaya!\n');

            // Target details lein
            const targetNumber = readline.question('Target नंबर (country code सहित, जैसे 919xxxxxxxxx): ');
            const targetName = readline.question('Target नाम: ');
            const speed = parseInt(readline.question('Speed (seconds mein delay): ')) * 1000;
            const msgFile = readline.question('Message file ka naam (जैसे message.txt): ');

            // Message file ko padhain
            let messageText = '';
            try {
                messageText = fs.readFileSync(msgFile, 'utf-8');
            } catch (e) {
                console.log('❌ Message file nahi mili!');
                process.exit(1);
            }

            // Target ko message bhejein
            await new Promise(resolve => setTimeout(resolve, speed));
            await sock.sendMessage(`${targetNumber}@s.whatsapp.net`, {
                text: `नमस्ते ${targetName},\n\n${messageText}`
            });
            console.log('✅ Message bhej diya gaya!');
            process.exit(0);
        }
    });
}

startBot();
