import { Composer } from "telegraf";
import type { ContextWithEnv } from "../envs";
import { delay } from "../helpers";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_TEXT = `
*Commands*:
/[d]uration \\<link\\> \\- get duration
/[t]imestamp \\<link?t\\=1\\> \\- convert timestamp
/dt \\- /duration & /timestamp combined
/help \\- display help message`;

const START_TEXT =
  `Beep-boop. I'm a [ro]bot.\\
I see a YouTube link. I fetch duration. I also convert timestamp.\\
May or may not take your job. Still deciding
` + HELP_TEXT;

const MOMS_ID = process.env.SECRET_ID;

const simpleCommands = new Composer<ContextWithEnv>();

// Every chat with bot starts from /start
simpleCommands.start((ctx) => {
  ctx.replyWithMarkdownV2(START_TEXT);
});

simpleCommands.help((ctx) => {
  ctx.replyWithMarkdownV2(HELP_TEXT);
});

simpleCommands.command(["hi", "hello"], async (ctx) => {
  if (MOMS_ID && ctx.message.from.id === Number(MOMS_ID)) {
    return ctx.sendMessage(`hi mom ❤️`);
  }

  switch (ctx.message.from.username) {
    case "mrv1k": {
      return ctx.sendMessage(`hi dad 🥸`);
    }
    case "JemboDev": {
      return ctx.sendMessage(`hello bröther`);
    }
    case "LexBorisoff": {
      return ctx.sendMessage("hello Lehman");
    }
    case "gelotheprodigy": {
      return ctx.sendMessage(`gelo 🤨`);
    }

    default: {
      if (ctx.message.chat.type === "group") {
        return ctx.sendMessage("sup ya'll");
      }
      ctx.sendMessage("hi");
    }
  }
});

const six9 = [`69 (•^~^•)`, `69ඞ`, `⁶⁹`, `69 (•^~^•)`, `6️⃣9️⃣`, `69 🌝`, `🍑𓂸`];
simpleCommands.command("69", async (ctx) => {
  if (ctx.message.from.username === "JemboDev") {
    ctx.sendMessage(six9[Math.floor(Math.random() * six9.length)]);
  }
  if (ctx.message.from.username === "mrv1k") {
    ctx.sendMessage(`𓆏💥╾━╤デ╦︻ඩා`);
  }
});

simpleCommands.command(["bye", "cya"], async (ctx) => {
  if (ctx.chat.type === "private") {
    ctx.sendMessage(
      "Nothing can make me leave this amazing conversation with you ;)",
    );
    return;
  }

  if (MOMS_ID && ctx.message.from.id === Number(MOMS_ID)) {
    ctx.sendMessage("bye mom 😘");
    await delay(2000);
    return ctx.leaveChat();
  }

  switch (ctx.message.from.username) {
    case "mrv1k": {
      ctx.sendMessage("please dad!");
      await delay(2000);
      ctx.sendMessage("i don't want to go :(");
      await delay(2000);
      ctx.sendMessage("bye dad 🫡");
      await delay(2000);
      return ctx.leaveChat();
    }
    case "JemboDev": {
      ctx.sendMessage("Adieu");
      await delay();
      ctx.sendMessage("goodbye");
      await delay();
      ctx.sendMessage("auf Wiederseh'n");
      return ctx.leaveChat();
    }
    case "LexBorisoff": {
      ctx.sendMessage("What are you doing Yakutza?");
      await delay();
      return ctx.sendMessage("☠️");
    }
    case "gelotheprodigy": {
      await delay(6969);
      return ctx.reply("no 🤨");
    }
    default: {
      if (ctx.message.chat.type === "group") {
        return ctx.sendMessage("cya all");
      }
      ctx.sendMessage("bye");
    }
  }
});

export default simpleCommands;
