require("dotenv").config({ path: "../.env" });

const { Telegraf } = require("telegraf");
const urlParser = require("js-video-url-parser/lib/base");
require("js-video-url-parser/lib/provider/youtube");

const fetchDuration = require("./fetchDuration");
const formatDuration = require("./formatDuration");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("WIP"));

// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, async (ctx) => {
  const url = ctx.match.input;
  // Parsing an incorrect url or trying to create one with an invalid object will return undefined
  const parsed = urlParser.parse(url);
  if (parsed === undefined) {
    return ctx.reply("Could not parse the YouTube's url");
  }

  const duration = await fetchDuration(parsed.id);
  const formattedDuration = formatDuration(duration);
  ctx.reply(`Duration: ${formattedDuration}`, {
    reply_to_message_id: ctx.message.message_id,
  });
});

bot.command("stfu", (ctx) => {
  // TODO: silence mode
});
bot.command("unstfu", (ctx) => {
  // TODO: disable silenec mode
});
bot.command("gtfo", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

bot.launch();

console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
