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
import { HELP_MESSAGE, START_MESSAGE } from "./text";

const bot = new Telegraf(process.env.BOT_TOKEN);

// TODO: refactor to work for multiple chats
const settings = {
  duration: true,
  timestamp: true,
};

const word = (setting: boolean) => (setting ? "Disable" : "Enable");
bot.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    // TODO: should toggle between enable/disable
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
    return ctx.reply(timestampText, {
      reply_to_message_id: replyArg.message_id,
    });
  }

  const command = ctx.message.text;
  return ctx.reply(`${command} <url>?timestamp=666`);
});

const REG_EXP = {
  // Match youtube or youtu.be; tests - https://regexr.com/5sve6
  YOUTUBE_URL: /youtu(\.)?be/,
  // Match anything between 0:00 to 99:99:99; Tests - https://regexr.com/5svdb
  // starting space is not a typo
  TELEGRAM_TIMESTAMP: / (\d{1,2}:\d{1,2}(?::\d{1,2})?)/,
};

const noUserTimestamp = (text = "") => !REG_EXP.TELEGRAM_TIMESTAMP.test(text);

// Listen for texts containing YouTube's url
bot.url(REG_EXP.YOUTUBE_URL, async (ctx) => {
  if (!settings.timestamp && !settings.duration) return;

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);

  const texts: string[] = [];

  const message = deunionize(ctx.message)?.text;
  if (settings.timestamp && noUserTimestamp(message)) {
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
  ctx.reply(text, options);
});

bot.command(["d", "duration"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);

  if (textArg) {
    const parsedUrl = parseUrl(textArg);
    const duration = await getDurationText(parsedUrl);
    return ctx.reply(duration, {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const parsedUrl = parseUrl(replyArg.text);
    const duration = await getDurationText(parsedUrl);
    return ctx.reply(duration, {
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
  return ctx.reply(durationText, {
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
