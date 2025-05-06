const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, delay } = require('@whiskeysockets/baileys');
const fs = require('fs');
const readline = require('readline');
const chalk = require('chalk');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function printBanner() {
  console.clear();
  console.log(chalk.greenBright(`
╔════════════════════════════════════════╗
║     WhatsApp Message Sender Tool      ║
╚════════════════════════════════════════╝
${chalk.cyanBright('Author')}   : 🔥 POWER STAR VEER 🔥
${chalk.yellowBright('GitHub')}   : https://github.com/sameerkhan0
${chalk.magentaBright('Version')}  : Termux Auto Sender v2
  `));
}

async function startSendingMessages(socket, number, messages, delaySec, prefix) {
  while (true) {
    for (const message of messages) {
      try {
        const time = new Date().toLocaleTimeString();
        const fullMessage = `${prefix} ${message}`;
        await socket.sendMessage(`${number}@c.us`, { text: fullMessage });

        console.log(chalk.cyan(`\n[Target Number] => ${number}`));
        console.log(chalk.green(`[Time] => ${time}`));
        console.log(chalk.yellow(`[Message] => ${fullMessage}`));
        console.log(chalk.magenta(`[Status] => Sent successfully`));

        await delay(delaySec * 1000);
      } catch (err) {
        console.log(chalk.red(`[Error] => ${err.message}. Retrying...`));
        await delay(5000);
      }
    }
  }
}

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    logger: { level: 'silent' }
  });

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      printBanner();
      console.log(chalk.green('✅ WhatsApp Connected Successfully!\n'));

      const target = await askQuestion(chalk.greenBright('[>] Enter Target Number: '));
      const filePath = await askQuestion(chalk.cyan('[>] Enter Message File Path: '));

      let messages = [];
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        messages = fileContent.split('\n').filter(Boolean);
      } catch {
        console.log(chalk.red('❌ Message file not found.'));
        process.exit(1);
      }

      const prefix = await askQuestion(chalk.yellow('[>] Enter Message Prefix (e.g., Name): '));
      const delayTime = parseInt(await askQuestion(chalk.magenta('[>] Enter Delay (seconds): ')));

      console.log(chalk.blue('\nStarting to send messages...\n'));
      await startSendingMessages(sock, target, messages, delayTime, prefix);
    }

    if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
      console.log(chalk.red('\n❌ Disconnected. Trying to reconnect...'));
      setTimeout(connectWhatsApp, 5000);
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

process.on('uncaughtException', (err) => {
  const msg = String(err);
  if (!msg.includes("Socket connection timeout") && !msg.includes("rate-overlimit")) {
    console.error('Uncaught Exception:', err);
  }
});

printBanner();
connectWhatsApp();
