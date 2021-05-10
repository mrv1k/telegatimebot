require("dotenv").config({ path: "../.env" });

const { Telegraf } = require("telegraf");
const urlParser = require("js-video-url-parser/lib/base");
require("js-video-url-parser/lib/provider/youtube");

const fetchDuration = require("./fetchDuration");
const formatDuration = require("./formatDuration");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) =>
  ctx.reply(`
Get video duration:
/duration <url>
`)
);

// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, (ctx) => {
  const url = ctx.match.input;
  sendDurationReply(ctx, url);
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

bot.command(["length", "duration"], async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    const rick_url = "https://youtu.be/oHg5SJYRHA0";
    await ctx.reply("Gets youtube video duration.");
    const botMessage = await ctx.reply(`${params[0]} ${rick_url}`, {
      disable_web_page_preview: true,
    });

    console.log(botMessage.message_id, ctx.message.message_id);

    await sendDurationReply(ctx, rick_url, botMessage.message_id);
    return;
  }

  const url = params[1];
  await sendDurationReply(ctx, url);
});

bot.launch();

console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

async function getDuration(url) {
  // Parsing an incorrect url or trying to create one with an invalid object will return undefined
  const parsed = urlParser.parse(url);
  if (parsed === undefined) {
    return ctx.reply("Could not parse the YouTube's url");
  }
  const duration = await fetchDuration(parsed.id);
  return formatDuration(duration);
}

async function sendDurationReply(ctx, url, reply_id) {
  let reply_to_message_id = reply_id ?? ctx.message.message_id;
  const duration = await getDuration(url);

  ctx.reply(`Duration: ${duration}`, {
    reply_to_message_id,
  });
}
