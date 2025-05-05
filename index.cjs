const { default: makeWASocket, useMultiFileAuthState } = require('baileys');
const readline = require('readline-sync');
const fs = require('fs');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  const userNumber = readline.question('अपना WhatsApp नंबर डालें (जैसे 919876543210): ');
  console.log(`आपका नंबर: ${userNumber}`);

  if (!state.creds.registered) {
    const code = await sock.requestPairingCode(userNumber);
    console.log('\n🔗 अपने WhatsApp में जाएँ: Settings > Linked Devices > Link with phone number');
    console.log(`\n👉 Pairing Code: ${code}`);
    console.log('⏳ पेयरिंग होने तक इंतज़ार करें...\n');
  }

  sock.ev.on('connection.update', async (update) => {
    if (update.connection === 'open') {
      console.log('✅ कनेक्शन हो गया!');

      const targetNumber = readline.question('Target नंबर: ');
      const targetName = readline.question('Target नाम: ');
      const delay = parseInt(readline.question('Speed (सेकंड): ')) * 1000;
      const msgFile = readline.question('Message file (जैसे msg.txt): ');

      let message = '';
      try {
        message = fs.readFileSync(msgFile, 'utf-8');
      } catch {
        console.log('❌ मैसेज फाइल नहीं मिली!');
        process.exit(1);
      }

      await new Promise(resolve => setTimeout(resolve, delay));

      await sock.sendMessage(`${targetNumber
