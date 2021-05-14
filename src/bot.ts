import "dotenv/config";

import { deunionize, Markup, Telegraf } from "telegraf";
import type { ExtraReplyMessage } from "telegraf/typings/telegram-types";

import {
  findFirstArg,
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  getUrlTimestampOrThrow,
  parseUrl,
} from "./core";

const bot = new Telegraf(process.env.BOT_TOKEN);

// TODO: refactor to work for multiple chats
const settings = {
  duration: true,
  timestamp: true,
};

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
  settings.duration = false;
  settings.timestamp = false;
});
bot.action("disable_duration", (ctx) => {
  settings.duration = !settings.duration;
  console.log("disable_duration", ctx);
});
bot.action("disable_timestamp", (ctx) => {
  settings.timestamp = !settings.timestamp;
  console.log("disable_timestamp", ctx);
});

// special hi for jembo's bot
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
/duration <url> - display video duration
/timestamp <url>?t=123 - convert to telegram timestamp
/settings - open settings

/d - shorthand for /duration
/t - shorthand for /timestamp
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
  return ctx.reply(`${command} <url>?timestamp=666`);
});

// Listen for text with url containing youtube
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

// TODO: Display user friend error messages
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
