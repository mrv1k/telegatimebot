import { Composer } from "telegraf";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_MESSAGE = `
I obey\\.\\.\\. to following *commands*:
/duration \\<link\\> \\- get duration
/timestamp \\<link?t\\=1\\> \\- convert timestamp
/dt \\- get duration and convert timestamp
\\<link\\> can also be a reply message

*Other:*
/settings \\- open settings
/help \\- display help message
/d \\- for /duration
/t \\- for /timestamp

_Not all commands are added to_ '/' _suggestions_`;
const START_MESSAGE =
  `I help by providing following info for a YouTube's link with:
1\\. Video duration
2\\. Telegram friendly timestamp

By default, I automatically listen to YouTube's links\\. \
Just send a message and I'll fetch the info\\. \
Can be disabled in /settings
` + HELP_MESSAGE;

const textCommands = new Composer();

// Every chat with bot starts from /start
textCommands.start((ctx) => {
  ctx.replyWithMarkdownV2(START_MESSAGE);
});
textCommands.help((ctx) => {
  ctx.replyWithMarkdownV2(HELP_MESSAGE);
});

textCommands.command("hi", async (ctx) => {
  if (ctx.message.chat.type === "group") {
    return ctx.reply("Hi everybody");
  }
  ctx.reply("Hello");
});

textCommands.command("bye", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

export default textCommands;
