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

    const clearAndBanner = () => {
      console.clear();
      console.log(`[1;32m
//////     ****   //**   /////// ////// ///// /**          //  /// ** //      /**      /**   /** /*********  **  //** /** //***  //******* /******* /*******
//////// /  //   //////  /////  ////
/////////   /    //      /      /  //* ******** /**     //        ////   //** ////////  //      // //         // //////// //////// //     //
[√][1;35m〓〓〓〓〓〓〓〓〓〓【𝐃𝐄𝐕𝐈𝐋 𝐓𝐎𝐎𝐋】〓〓〓〓〓〓〓〓〓〓〓〓
[√][1;32mAuthor  : 【𝐌𝐑 𝐃𝐄𝐕𝐈𝐋】
[√][1;33mGitHub  : 【】sameerkhan0
[√][1;36m Tool  : ︻╦デ╤━╼【𝐃𝐄𝐕𝐈𝐋 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐋𝐎𝐀𝐃𝐄𝐑 𝐒𝐄𝐍𝐃𝐄𝐑】╾━╤デ╦︻
[√][1;35m〓〓〓〓〓〓〓〓〓〓【 𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐖𝐇𝐀𝐓𝐒𝐀𝐏𝐏 𝐓𝐎𝐎𝐋】〓〓〓〓〓〓〓〓〓〓〓〓
`);
    };

    let targetNumber = null;
    let messages = null;
    let delaySeconds = null;
    let haterName = null;

    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    async function sendLoop(sock) {
      while (true) {
        for (const msg of messages) {
          try {
            const time = new Date().toLocaleTimeString();
            const fullMessage = haterName + " " + msg;
            await sock.sendMessage(targetNumber + "@c.us", { text: fullMessage });
            console.log("[1;36m【Target Number】=> [0m" + targetNumber);
            console.log("[1;32m【Time】=> [0m" + time);
            console.log("[1;33m【Message】=> [0m" + fullMessage);
            console.log("[1;35m [ 〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓【𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐓𝐎𝐎𝐋】〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓]");
            await delay(delaySeconds * 1000);
          } catch (err) {
            console.log("[1;33mError sending message: " + err.message + ". Retrying..." + "[0m");
            await delay(5000);
          }
        }
      }
    }

    const startBot = async () => {
      const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state
      });

      if (!sock.authState.creds.registered) {
        clearAndBanner();
        const phone = await ask("[1;32m[√] Enter Your Phone Number => [0m");
        const code = await sock.requestPairingCode(phone);
        clearAndBanner();
        console.log("[1;36m[√] Your Pairing Code Is => [0m" + code);
      }

      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
          clearAndBanner();
          console.log("[1;36m[Your WhatsApp Login ✓][0m");
          if (!targetNumber || !messages || !delaySeconds || !haterName) {
            targetNumber = await ask("[1;92m[√] 【Enter Target Number】 ===> [0m");
            const msgFile = await ask("[1;36m[+] 【Enter Message File Path】 ===> [0m");
            messages = fs.readFileSync(msgFile, "utf-8").split("\n").filter(Boolean);
            haterName = await ask("[1;32m[√] 【Enter Hater Name】===> [0m");
            delaySeconds = await ask("[1;33m[√] 【Enter Message Delay】===> [0m");
            console.log("[1;36mAll Details Are Filled Correctly[0m");
            clearAndBanner();
            console.log("[1;35mNow Start Message Sending.......[0m");
            console.log("[1;36m[〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓 [𝐌𝐑 𝐃𝐄𝐕𝐈𝐋 𝐈𝐒 𝐇𝐄𝐑𝐄] 〓〓〓〓〓〓〓〓〓〓〓〓〓〓〓]");
            console.log('');
            await sendLoop(sock);
          }
        }

        if (connection === "close" && lastDisconnect?.error) {
          const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
          if (shouldReconnect) {
            console.log("Network issue, retrying in 5 seconds...");
            setTimeout(startBot, 5000);
          } else {
            console.log("Connection closed. Please restart the script.");
          }
        }
      });

      sock.ev.on("creds.update", saveCreds);
    };

    await startBot();

    process.on("uncaughtException", function (err) {
      const message = String(err);
      if (message.includes("Socket connection timeout") || message.includes("rate-overlimit")) return;
      console.log("Caught exception: ", err);
    });

  } catch (err) {
    console.error("Error importing modules:", err);
  }
})();
