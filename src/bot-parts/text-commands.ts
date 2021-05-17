import { Composer } from "telegraf";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_MESSAGE = `
You can control me by sending these *commands*:
/duration \\<link\\> \\- display video duration
/timestamp \\<link with timestamp\\> \\- create telegram timestamp
/settings \\- open settings
/help \\- display help message

*Shorthands:*
/d \\- for /duration
/t \\- for /timestamp

_To avoid polluting commands only /duration and /timestamp are added to the list of commands_
`;

const START_MESSAGE =
  `I help you by replying to YouTube's link with:
1\\. Video duration
2\\. Telegram friendly timestamp

By default, I automatically listen to YouTube's links\\. \
Just send a message and I'll fetch the info\\. \
Can be disabled in /settings
` + HELP_MESSAGE;

const bot = new Composer();

// Every chat with bot starts from /start
bot.start((ctx) => ctx.replyWithMarkdownV2(START_MESSAGE));
bot.help((ctx) => ctx.replyWithMarkdownV2(HELP_MESSAGE));

bot.command("hi", async (ctx) => {
  if (ctx.message.chat.type === "group") {
    ctx.reply("Hi meatbags");
  }
  ctx.reply("Hello sunshine");
});

bot.command("bye", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

export default bot;
