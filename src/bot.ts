import "dotenv/config";

import { deunionize, Markup, Telegraf } from "telegraf";
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

bot.command("hi", (ctx) => {
  ctx.reply("Hey meatbags");
});
bot.command("bye", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});
bot.help((ctx) =>
  ctx.reply(`
/[d]uration <url>
/[t]imestamp <url>?t=666
`)
);

if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());

// TODO: enable users to send command via reply
//   console.log(ctx.message.reply_to_message);
bot.command(["t", "timestamp"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);
  if (textArg) {
    const parsedUrl = parseUrl(textArg);
    const timestamp = getUrlTimestampOrThrow(parsedUrl);
    const timestampText = getTimestampText(timestamp);
    return ctx.reply(timestampText, {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  // TODO: almost identical to duration reply
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const parsedUrl = parseUrl(replyArg.text);
    const timestamp = getUrlTimestampOrThrow(parsedUrl);
    const timestampText = getTimestampText(timestamp);
    return ctx.replyWithMarkdownV2(timestampText, {
      reply_to_message_id: replyArg.message_id,
    });
  }

  const command = ctx.message.text;
  return ctx.reply(`${command} <url>?timestamp=123`);
});

// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, async (ctx) => {
  const matchedUrl = ctx.match.input;
  const parsedUrl = parseUrl(matchedUrl);

  const texts: string[] = [];
  if (settings.timestamp) {
    const timestamp = getUrlTimestamp(parsedUrl);
    if (timestamp) {
      texts.push(getTimestampText(timestamp));
    }
  }
  if (settings.duration) {
    texts.push(await getDurationText(parsedUrl));
  }
  const text = texts.join("\n");

  const options: ExtraReplyMessage = {
    reply_to_message_id: ctx.message?.message_id,
    disable_notification: true,
  };
  ctx.replyWithMarkdownV2(text, options);
});

bot.command(["d", "duration"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);

  if (textArg) {
    const parsedUrl = parseUrl(textArg);
    const duration = await getDurationText(parsedUrl);
    return ctx.replyWithMarkdownV2(duration, {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const parsedUrl = parseUrl(replyArg.text);
    const duration = await getDurationText(parsedUrl);
    return ctx.replyWithMarkdownV2(duration, {
      reply_to_message_id: replyArg.message_id,
    });
  }

  // else show an example
  await ctx.reply("Gets YouTube video duration.");
  const command = ctx.message.text;
  const rickUrl = "https://youtu.be/oHg5SJYRHA0";
  const botMessage = await ctx.reply(`${command} ${rickUrl}`, {
    disable_web_page_preview: true,
  });

  const stubbedParseUrl = { id: "oHg5SJYRHA0" };
  const durationText = await getDurationText(stubbedParseUrl);
  return ctx.replyWithMarkdownV2(durationText, {
    reply_to_message_id: botMessage.message_id,
  });
});

bot.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    // TODO: should toggle between enable/disable
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Disable all", "disable_all")],
      [
        Markup.button.callback("Disable duration", "disable_duration"),
        Markup.button.callback("Disable timestamp", "disable_timestamp"),
      ],
    ]),
  });
});
bot.action("disable_all", (ctx) => {
  console.log("disable_all", ctx);
});
bot.action("disable_duration", (ctx) => {
  console.log("disable_duration", ctx);
});
bot.action("disable_timestamp", (ctx) => {
  console.log("disable_timestamp", ctx);
});

bot.catch((err, ctx) => {
  // "¯\\_(ツ)_/¯ It's a live stream";
  console.log("caught!", err);
  ctx.reply("apologies, something broke");
});

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

function parseUrl(text: string) {
  const parsedUrl = urlParser.parse(text);
  if (parsedUrl) return parsedUrl;
  throw Error("Could not parse YouTube's URL");
}

function getUrlTimestamp(parsedUrl: VideoInfo) {
  const params = parsedUrl?.params;

  // url parser uses 0 if ?t param is found but failed to parse, ie: ?t=123a or ?t=-1
  if (params && typeof params.start === "number" && params.start > 0) {
    // start is timestamp
    return params.start;
  }
}

function getUrlTimestampOrThrow(parsedUrl: VideoInfo) {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) return parsed;
  throw Error("Could not get timestamp");
}

function getTimestampText(timestamp: number) {
  const timestampText = formatTime(secondsToTime(timestamp));
  return `Timestamp: ${timestampText}`;
}

async function getDurationText(parsedUrl: VideoInfo) {
  const duration = await fetchDuration(parsedUrl.id);
  // use underscore to display as italic with markdown renderer to break rendering as clickable timestamp
  return `Duration: _${formatTime(duration)}_`;
}

function findFirstArg(text: string) {
  const parts = text.split(/ +/);
  if (parts.length === 1) return false;
  return parts[1];
}
