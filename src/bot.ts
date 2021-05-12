import "dotenv/config";

import { Telegraf, Composer } from "telegraf";
import { Context } from "telegraf/typings";
import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";

import fetchDuration from "./fetchDuration";
import { formatTime, secondsToTime } from "./time";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply("Hey meatbags"));
bot.help((ctx) =>
  ctx.reply(`
/[d]uration <url>
/[t]imestamp <url>?t=666
`)
);

// TODO: enable users to send command via reply
// bot.command("t", async (ctx) => {
//   console.log(ctx.message.reply_to_message);
// });

if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());

bot.command("timestamp", async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    return ctx.reply("Converts to telegram timestamp.");
  }

  const url = params[1];
  const parsedUrl = urlParser.parse(url);

  if (!parsedUrl) {
    return ctx.reply("Could not parse YouTube's url");
  }

  const urlParams = parsedUrl?.params;
  if (!urlParams || !Number.isFinite(urlParams.start)) {
    return ctx.reply("Could not parse timestamp");
  }

  const timestamp: number = urlParams.start;

  const formattedTime = formatTime(secondsToTime(timestamp));
  ctx.reply(formattedTime, { reply_to_message_id: ctx.message.message_id });
});

const settings = {
  duration: true,
};

bot.command("/durationtoggle", () => {
  settings.duration = !settings.duration;
});

// regex tests - https://regexr.com/5si73
bot.url(
  /youtu(\.)?be/,
  Composer.optional(
    () => settings.duration,
    (ctx) => {
      console.log("toggle", settings.duration);

      const url = ctx.match.input;
      sendDurationReply(ctx, url);
    }
  )
);

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

bot.settings((ctx) => {
  console.log("settings!");
});
bot.catch((err, ctx) => {
  // "¯\\_(ツ)_/¯ It's a live stream";
  console.log(err);
});

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

async function getDuration(url: string) {
  // Parsing an incorrect url or trying to create one with an invalid object will return undefined
  const parsedUrl = urlParser.parse(url);
  if (parsedUrl === undefined) return;

  const duration = await fetchDuration(parsedUrl.id);
  return formatTime(duration);
}

async function sendDurationReply<CTX extends Context>(
  ctx: CTX,
  url: string,
  reply_id?: number
) {
  if (ctx === undefined) return;
  // ctx.mess
  const reply_to_message_id = reply_id ?? ctx.message?.message_id;
  const duration = await getDuration(url);

  if (duration) {
    return ctx.reply(`Duration: ${duration}`, {
      reply_to_message_id,
    });
  }

  ctx.reply("Could not parse YouTube's url");
}
