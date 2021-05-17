import "dotenv/config";

import { deunionize, Telegraf } from "telegraf";

import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  getUrlTimestampOrThrow,
  parseUrl,
} from "./core";
import { templateReply, findFirstArg } from "./bot-parts/helpers";
import errorHandler from "./bot-parts/error-handler";
import settings from "./bot-parts/settings";
import { HELP_MESSAGE, START_MESSAGE } from "./bot-parts/text";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch(errorHandler);

bot.use(settings);

if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());

// TODO: special hi for jembo's bot
bot.command("hi", (ctx) => {
  ctx.reply("Hey meatbags");
});

bot.command("bye", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

// Every chat with bot starts from /start
bot.start((ctx) => ctx.replyWithMarkdownV2(START_MESSAGE));
bot.help((ctx) => ctx.replyWithMarkdownV2(HELP_MESSAGE));

bot.command(["t", "timestamp"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);
  if (textArg) {
    const timestamp = getUrlTimestampOrThrow(parseUrl(textArg));
    const timestampText = getTimestampText(timestamp);
    return templateReply(ctx, timestampText, ctx.message.message_id);
  }

  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const timestamp = getUrlTimestampOrThrow(parseUrl(replyArg.text));
    const timestampText = getTimestampText(timestamp);
    return templateReply(ctx, timestampText, replyArg.message_id);
  }

  // else show an example
  const command = ctx.message.text;
  return ctx.reply(`${command} link?timestamp=666`);
});

const durationCommands = ["d", "duration"];
bot.command(durationCommands, async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) return next();

  const duration = await getDurationText(parseUrl(textArg));
  templateReply(ctx, duration, ctx.message.message_id);
});

bot.command(durationCommands, async (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) return next();

  const duration = await getDurationText(parseUrl(replyArg.text));
  if (duration) {
    templateReply(ctx, duration, replyArg.message_id);
  }
});

bot.command(durationCommands, async (ctx) => {
  // else show an example
  await ctx.reply("Gets YouTube video duration. For example:");
  const command = ctx.message.text;
  const rickUrl = "https://youtu.be/oHg5SJYRHA0";
  const botMessage = await ctx.reply(`${command} ${rickUrl}`, {
    disable_web_page_preview: true,
    disable_notification: true,
  });
  // stub API call for the example, for explanation on format go to #getDurationText
  const stubbedDuration = `Duration: \u200c3:33`;
  templateReply(ctx, stubbedDuration, botMessage.message_id);
});

const REG_EXP = {
  // Match youtube or youtu.be; tests - https://regexr.com/5sve6
  YOUTUBE_URL: /youtu(\.)?be/,
  // Match anything between 0:00 to 99:99:99; Tests - https://regexr.com/5t1ib
  TELEGRAM_TIMESTAMP: /(\d{1,2}:\d{1,2}(?::\d{1,2})?)/,
};

const hasUserTimestamp = (text = "") => REG_EXP.TELEGRAM_TIMESTAMP.test(text);

// Listen for texts containing YouTube's url
bot.url(REG_EXP.YOUTUBE_URL, async (ctx) => {
  // if (!settings.timestamp && !settings.duration) return;
  if (!ctx.message) return;
  const message = deunionize(ctx.message);

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);
  const texts: string[] = [];

  // if (settings.timestamp && hasUserTimestamp(message.text) === false) {
  const timestamp = getUrlTimestamp(parsedUrl);
  if (timestamp) {
    texts.push(getTimestampText(timestamp));
  }
  // }
  // if (settings.duration) {
  texts.push(await getDurationText(parsedUrl));
  // }

  const text = texts.join("\n");
  return templateReply(ctx, text, ctx.message.message_id);
});

// Defensive programming FTW!
bot.mention(process.env.BOT_USERNAME, async (ctx) => {
  if (!ctx.message) return;
  const message = deunionize(ctx.message);

  const replyMessage = deunionize(message.reply_to_message);
  if (!replyMessage || !replyMessage.text) return;

  const entities = replyMessage.entities;
  if (!entities) return;

  const firstUrl = entities.find((entity) => entity.type === "url");
  if (!firstUrl) return;

  const url = replyMessage.text.slice(firstUrl.offset, firstUrl.length);
  const parsedUrl = parseUrl(url);
  const texts: string[] = [];

  // Explicit command call, don't check settings or user provided timestamp
  const timestamp = getUrlTimestamp(parsedUrl);
  if (timestamp) {
    texts.push(getTimestampText(timestamp));
  }
  // Always include duration
  texts.push(await getDurationText(parsedUrl));

  const text = texts.join("\n");
  return templateReply(ctx, text, replyMessage.message_id);
});

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
process.title = process.env.BOT_USERNAME;
