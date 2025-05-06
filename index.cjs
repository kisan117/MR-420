const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const readline = require('readline');
const fs = require('fs');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function ask(question) {
  return new Promise(resolve => rl.question(question, ans => resolve(ans)));
}

async function main() {
  const userNumber = await ask(chalk.cyan("Enter your WhatsApp number (with country code): "));
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(chalk.green('\nConnected successfully!'));

      await sock.sendMessage(userNumber + "@s.whatsapp.net", { text: "✅ Your WhatsApp paired successfully with MR DEVIL TOOL." });

      const targetNumber = await ask(chalk.cyan("Enter target number (with country code): "));
      const targetName = await ask(chalk.cyan("Enter target name: "));
      const speed = parseInt(await ask(chalk.cyan("Enter speed in ms between messages: ")));
      const msgFilePath = await ask(chalk.cyan("Enter message file path (e.g., messages.txt): "));

      if (!fs.existsSync(msgFilePath)) {
        console.log(chalk.red("Message file not found!"));
        process.exit(1);
      }

      const messages = fs.readFileSync(msgFilePath, 'utf-8').split('\n').filter(msg => msg.trim() !== '');
      console.log(chalk.yellow(`\nStarting message sending to ${targetName} (${targetNumber})...\n`));

      let index = 0;
      while (true) {
        const msg = messages[index % messages.length];
        await sock.sendMessage(targetNumber + "@s.whatsapp.net", { text: msg });
        console.log(chalk.green(`[SENT] ${msg}`));
        index++;
        await new Promise(res => setTimeout(res, speed));
      }
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== 401;
      console.log(chalk.red("Connection closed. Reconnecting..."), shouldReconnect);
      if (shouldReconnect) main();
    }
  });
}

main();
