require("dotenv").config({ path: "../.env" });

const { Telegraf } = require("telegraf");
const urlParser = require("js-video-url-parser/lib/base");
require("js-video-url-parser/lib/provider/youtube");

const fetchDuration = require("./fetchDuration");
const formatDuration = require("./formatDuration");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Hey meatbags"));
bot.help((ctx) =>
  ctx.reply(`
/duration <url>
/timestamp <url>?t=666
`)
);

bot.command("timestamp", async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    return ctx.reply("Converts to telegram timestamp.");
  }

  const url = params[1];
  const parsedUrl = urlParser.parse(url);
  if (parsedUrl === undefined) {
    ctx.reply("Could not parse YouTube's url");
  }

  const timestamp = parsedUrl?.params?.start;
  if (timestamp) {
    const formattedTime = formatDuration(secondsToHms(timestamp));
    ctx.reply(formattedTime, { reply_to_message_id: ctx.message.message_id });
    return;
  }

  ctx.reply("Couldn't parse timestamp");
});

// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, (ctx) => {
  const url = ctx.match.input;
  sendDurationReply(ctx, url);
});

bot.command(["length", "duration"], async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    const rick_url = "https://youtu.be/oHg5SJYRHA0";
    await ctx.reply("Gets YouTube video duration.");
    const botMessage = await ctx.reply(`${params[0]} ${rick_url}`, {
      disable_web_page_preview: true,
    });

    await sendDurationReply(ctx, rick_url, botMessage.message_id);
    return;
  }

  const url = params[1];
  await sendDurationReply(ctx, url);
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

async function getDuration(url) {
  // Parsing an incorrect url or trying to create one with an invalid object will return undefined
  const parsedUrl = urlParser.parse(url);
  if (parsedUrl === undefined) return;

  const duration = await fetchDuration(parsedUrl.id);
  return formatDuration(duration);
}

async function sendDurationReply(ctx, url, reply_id) {
  let reply_to_message_id = reply_id ?? ctx.message.message_id;
  const duration = await getDuration(url);

  if (duration) {
    return ctx.reply(`Duration: ${duration}`, {
      reply_to_message_id,
    });
  }

  ctx.reply("Could not parse YouTube's url");
}

function secondsToHms(timestamp) {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor((timestamp % 3600) % 60);
  return { hours, minutes, seconds };
}
