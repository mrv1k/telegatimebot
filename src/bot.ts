import "dotenv/config";

import { Telegraf } from "telegraf";
import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";

import fetchDuration from "./fetchDuration";
import { formatTime, secondsToTime } from "./time";
import type { VideoInfo } from "js-video-url-parser/lib/urlParser";
import type { ExtraReplyMessage } from "telegraf/typings/telegram-types";

const bot = new Telegraf(process.env.BOT_TOKEN);

// TODO: refactor to work for multiple chats
const settings = {
  duration: true,
  timestamp: true,
};

bot.command("/durationtoggle", () => {
  settings.duration = !settings.duration;
});
bot.command("/timestamptoggle", () => {
  settings.duration = !settings.duration;
});

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
  const urlArg = findFirstArg(ctx.message.text);

  if (!urlArg) {
    const command = ctx.message.text;
    return ctx.reply(`${command} <url>?timestamp=123`);
  }

  const parsedUrl = urlParser.parse(urlArg);
  if (!parsedUrl) return ctx.reply("Could not parse YouTube's url");

  const urlParams = parsedUrl?.params;
  if (!urlParams || !Number.isFinite(urlParams.start)) {
    return ctx.reply("Could not parse timestamp");
  }
  const timestamp: number = urlParams.start;

  const formattedTime = formatTime(secondsToTime(timestamp));
  ctx.reply(formattedTime, { reply_to_message_id: ctx.message.message_id });
});

/**
 * 1. check if has youtube url
 *  a) if true - parse url
 *    parsed == undefined { reply with error }
 *    parsed success
 *      check if has timestamp
 *      if false { reply with duration }
 *      if true { reply with timestamp }
 */
// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, async (ctx) => {
  console.log("toggle", settings.duration);

  const url = ctx.match.input;
  const parsedUrl = urlParser.parse(url);
  if (!parsedUrl) return ctx.reply("Could not parse YouTube's URL");

  const messages: string[] = [];

  if (settings.timestamp) {
    // TODO: fix, copypasted timestamp command
    const urlParams = parsedUrl?.params;
    if (urlParams && Number.isFinite(urlParams.start)) {
      // don't say anything during inline mode?
      const timestamp: number = urlParams.start;

      const timestampText = formatTime(secondsToTime(timestamp));
      messages.push(`Timestamp: ${timestampText}`);
    }
  }

  if (settings.duration) {
    const durationText = await getDurationText(parsedUrl);
    messages.push(durationText);
  }

  const message = messages.join("\n");
  const options: ExtraReplyMessage = {
    reply_to_message_id: ctx.message?.message_id,
    disable_notification: true,
  };
  ctx.replyWithMarkdownV2(message, options);
});

// bot.command(["length", "duration"], async (ctx) => {
//   const urlArg = findFirstArg(ctx.message.text);

//   if (!urlArg) {
//     await ctx.reply("Gets YouTube video duration.");
//     const command = ctx.message.text;
//     const urlRick = "https://youtu.be/oHg5SJYRHA0";
//     const botMessage = await ctx.reply(`${command} ${urlRick}`, {
//       disable_web_page_preview: true,
//     });

//     const parsedUrl = urlParser.parse(url);
//     if (!parsedUrl) return ctx.reply("Could not parse YouTube's URL");
//     getDurationText();

//     return getDurationText(ctx, urlRick, botMessage.message_id);
//   }

//   getDurationText(ctx, urlArg);
// });

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

async function getDurationText(parsedUrl: VideoInfo) {
  const duration = await fetchDuration(parsedUrl.id);
  return `Duration: _${formatTime(duration)}_`;
}

function findFirstArg(text: string) {
  const parts = text.split(/ +/);
  if (parts.length === 1) return false;
  return parts[1];
}
