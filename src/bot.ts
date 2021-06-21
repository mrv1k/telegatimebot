import "dotenv/config";

import { deunionize, Telegraf } from "telegraf";

import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  getUrlTimestampOrThrow,
  parseUrl,
} from "./core";
import redis, { getSettingState } from "./core/redis";
import { templateReply, findFirstArg } from "./parts/helpers";
import errorHandler from "./parts/error-handler";
import settingsCommands, { Settings } from "./parts/settings-commands";
import textCommands from "./parts/text-commands";
import { hasNoUserTimestamp, YOUTUBE_URL } from "./parts/regexp";

const bot = new Telegraf(process.env.BOT_TOKEN);
process.title = process.env.BOT_USERNAME;

// Middleware
bot.catch(errorHandler);
if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());
bot.use(settingsCommands);
bot.use(textCommands);

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

bot.command(["dt", "td"], async (ctx) => {
  ctx.reply("WIP");
});

// Listen for texts containing YouTube's url
bot.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) return;
  const id = ctx.chat.id;

  const timestampIsEnabled = await getSettingState(id, Settings.timestamp);
  const durationIsEnabled = await getSettingState(id, Settings.duration);

  if (!timestampIsEnabled && !durationIsEnabled) return;

  const message = deunionize(ctx.message);

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);
  const texts: string[] = [];

  if (timestampIsEnabled && hasNoUserTimestamp(message.text)) {
    const timestamp = getUrlTimestamp(parsedUrl);
    if (timestamp) {
      texts.push(getTimestampText(timestamp));
    }
  }
  if (durationIsEnabled) {
    texts.push(await getDurationText(parsedUrl));
  }

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
process.once("SIGINT", () => {
  redis.disconnect();
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  redis.disconnect();
  bot.stop("SIGTERM");
});
