import { Composer } from "telegraf";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_TEXT = `
*Commands*:
/duration \\<link\\> \\- get duration
/timestamp \\<link?t\\=1\\> \\- convert timestamp
/dt \\- /duration & /timestamp combined
/d \\- shorthand for /duration
/t \\- shorthand for /timestamp
/settings \\- open settings
/help \\- display help message

hint: send \\<link\\> via reply message
click /timestamp to see an example

_Not all commands are added to_ '/' _suggestions_ or bot menu`;

const START_TEXT =
  `I solve YouTube in Telegram annoyances \
by getting duration and converting timestamp\\.

By default, I passively look for YouTube links\\. \
When I see one I fetch info\\. Can be disabled in /settings
Code is /opensource
To see this message again /start
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

simpleCommands.command("opensource", (ctx) => {
  ctx.reply("https://github.com/mrv1k/telegatimebot");
});

export default simpleCommands;
