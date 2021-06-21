import "dotenv/config";
import { deunionize, Telegraf } from "telegraf";
import durationCommands from "./commands/duration";
import settingsCommands, { Settings } from "./commands/settings";
import timestampCommands from "./commands/timestamp";
import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  parseUrl,
} from "./core";
import redis, { getSettingState } from "./core/redis";
import errorHandler from "./parts/error-handler";
import { templateReply } from "./parts/helpers";
import { hasNoUserTimestamp, YOUTUBE_URL } from "./parts/regexp";
import textCommands from "./parts/text-commands";

const bot = new Telegraf(process.env.BOT_TOKEN);
process.title = process.env.BOT_USERNAME;

// Middleware
bot.catch(errorHandler);
if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());
bot.use(settingsCommands);
bot.use(textCommands);
bot.use(timestampCommands);
bot.use(durationCommands);

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
