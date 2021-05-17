import "dotenv/config";

import { deunionize, Markup, Telegraf } from "telegraf";

import {
  templateReply,
  findFirstArg,
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  getUrlTimestampOrThrow,
  parseUrl,
} from "./core";
import errorHandler from "./error-handler";
import { HELP_MESSAGE, START_MESSAGE } from "./text";

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.catch(errorHandler);

if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());

// TODO: refactor to work for multiple chats
const settings = {
  duration: true,
  timestamp: true,
};

const word = (setting: boolean) => (setting ? "Disable" : "Enable");

bot.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Disable all", "disable_all")],
      [
        Markup.button.callback(
          `${word(settings.duration)} duration`,
          "toggle_duration"
        ),
        Markup.button.callback(
          `${word(settings.timestamp)} timestamp`,
          "toggle_timestamp"
        ),
      ],
    ]),
  });
});
bot.action("disable_all", (ctx) => {
  console.log("disable_all");
  settings.duration = false;
  settings.timestamp = false;
  ctx.answerCbQuery();
});
bot.action("toggle_duration", (ctx) => {
  settings.duration = !settings.duration;
  console.log("toggle_duration", ctx);
  ctx.answerCbQuery();
});
bot.action("toggle_timestamp", (ctx) => {
  settings.timestamp = !settings.timestamp;
  console.log("toggle_timestamp", ctx);
  ctx.answerCbQuery();
});

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

bot.command(["d", "duration"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);
  if (textArg) {
    const duration = await getDurationText(parseUrl(textArg));
    return templateReply(ctx, duration, ctx.message.message_id);
  }

  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const duration = await getDurationText(parseUrl(replyArg.text));
    if (duration) {
      return templateReply(ctx, duration, replyArg.message_id);
    }
  }

  // else show an example
  await ctx.reply("Gets YouTube video duration.");
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
  if (!settings.timestamp && !settings.duration) return;
  if (!ctx.message) return;
  const message = deunionize(ctx.message);

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);
  const texts: string[] = [];

  if (settings.timestamp && hasUserTimestamp(message.text) === false) {
    const timestamp = getUrlTimestamp(parsedUrl);
    if (timestamp) {
      texts.push(getTimestampText(timestamp));
    }
  }
  if (settings.duration) {
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

  const url = replyMessage.text.slice(firstUrl?.offset, firstUrl?.length);
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
