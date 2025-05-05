(async () => {
try {
const {
makeWASocket,
useMultiFileAuthState,
delay,
DisconnectReason
} = await import("@whiskeysockets/baileys");
const fs = await import('fs');
const pino = (await import("pino"))["default"];
const readline = (await import("readline")).createInterface({
input: process.stdin,
output: process.stdout
});
const ask = q => new Promise(res => readline.question(q, res));
const banner = () => {
console.clear();
console.log(`[1;32m
'

########  ######## ##     ## #### ##

## ##       ##     ##  ##

## ##       ##     ##  ##

## ######   ##     ##  ##

## ##        ##   ##   ##

## ##         ## ##    ##

########  ########    ###    #### ########

[√][1;35m〓〓〓〓〓〓〓〓〓〓【𝐃𝐄𝐕𝐈𝐋 𝐓𝐎𝐎𝐋 𝐎𝐖𝐍𝐄𝐑】〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓
[√][1;32mAuthor  : 【𝐌𝐑 𝐃𝐄𝐕𝐈𝐋】
[√][1;33mGitHub  : 【】https://github.com/kisan117/MR-BACHAN.git
[√][1;36m Tool  : ︻╦デ╤━╼【𝐃𝐄𝐕𝐈𝐋 𝐖𝐏 𝐋𝐎𝐀𝐃𝐄𝐑 𝐒𝐄𝐍𝐃𝐄𝐑】╾━╤デ╦︻
[√][1;35m〓〓〓〓〓〓〓〓〓〓【 𝐃𝐄𝐕𝐈𝐋 𝐖𝐏 𝐋𝐎𝐀𝐃𝐄𝐑 𝐓𝐎𝐎𝐋】〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓`);
};
let targetNumber = null;
let messageLines = null;
let delaySeconds = null;
let haterName = null;
const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

async function sendLoop(sock) {  
  while (true) {  
    for (const line of messageLines) {  
      try {  
        const time = new Date().toLocaleTimeString();  
        const msg = haterName + " " + line;  
        await sock.sendMessage(targetNumber + "@c.us", { text: msg });  
        console.log("[1;36m【Target Number】=> [0m" + targetNumber);  
        console.log("[1;32m【Time】=> [0m" + time);  
        console.log("[1;33m【Message】=> [0m" + msg);  
        console.log("[1;35m [〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓【𝐃𝐄𝐕𝐈𝐋 𝐓𝐎𝐎𝐋 𝐎𝐖𝐍𝐄𝐑】〓〓〓〓〓〓〓〓〓〓〓〓〓〓]");  
        await delay(delaySeconds * 1000);  
      } catch (err) {  
        console.log("[1;33mError sending message: " + err.message + ". Retrying..." + "[0m");  
        await delay(5000);  
      }  
    }  
  }  
}  

const startSock = async () => {  
  const sock = makeWASocket({  
    logger: pino({ level: "silent" }),  
    auth: state  
  });  

  if (!sock.authState.creds.registered) {  
    banner();  
    const phone = await ask("[1;32m[√] Enter Your Phone Number => [0m");  
    const code = await sock.requestPairingCode(phone);  
    banner();  
    console.log("[1;36m[√] Your Pairing Code Is => [0m" + code);  
  }  

  sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {  
    if (connection === "open") {  
      banner();  
      console.log("[1;36m[Your WhatsApp Login ✓][0m");  

      if (!targetNumber || !messageLines || !delaySeconds || !haterName) {  
        targetNumber = await ask("[1;92m[√] 【Enter Target Number】 ===> [0m");  
        const filePath = await ask("[1;36m[+] 【Enter Message File Path】 ===> [0m");  
        messageLines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);  
        haterName = await ask("[1;32m[√] 【Enter Hater Name】===> [0m");  
        delaySeconds = await ask("[1;33m[√] 【Enter Message Delay】===> [0m");  
        console.log("[1;36mAll Details Are Filled Correctly[0m");  
        banner();  
        console.log("[1;35mNow Start Message Sending.......[0m");  
        console.log("[1;36m  [〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓【𝐃𝐄𝐕𝐈𝐋 𝐏𝐀𝐏𝐀 𝐇𝐄𝐑𝐄】〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓]");  
        console.log('');  
        await sendLoop(sock);  
      }  
    }  
    if (connection === "close" && lastDisconnect?.error) {  
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;  
      if (shouldReconnect) {  
        console.log("Network issue, retrying in 5 seconds...");  
        setTimeout(startSock, 5000);  
      } else {  
        console.log("Connection closed. Please restart the script.");  
      }  
    }  
  });  

  sock.ev.on("creds.update", saveCreds);  
};  

await startSock();  

process.on("uncaughtException", function (err) {  
  let msg = String(err);  
  if (msg.includes("Socket connection timeout") || msg.includes("rate-overlimit")) return;  
  console.log("Caught exception: ", err);  
});

} catch (err) {
console.error("Error importing modules:", err);
}
})(); 

