import { Composer } from "telegraf";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_TEXT = `
*Commands*:
/[d]uration \\<link\\> \\- get duration
/[t]imestamp \\<link?t\\=1\\> \\- convert timestamp
/dt \\- /duration & /timestamp combined
/help \\- display help message`

const START_TEXT =
  `Brrr. Boop. I'm a simple [ro]bot. I see YouTube link.
I fetch duration. I can also convert YT timestamp to Telegram timestamp.

` + HELP_TEXT;

const simpleCommands = new Composer();

// Every chat with bot starts from /start
simpleCommands.start((ctx) => {
  ctx.replyWithMarkdownV2(START_TEXT);
});

simpleCommands.help((ctx) => {
  ctx.replyWithMarkdownV2(HELP_TEXT);
});

simpleCommands.command("hi", async (ctx) => {
  if (ctx.message.chat.type === "group") {
    return ctx.reply("Hi everybody");
  }
  ctx.reply("Hello");
});

simpleCommands.command("bye", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

export default simpleCommands;
