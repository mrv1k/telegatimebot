import { Composer, deunionize } from "telegraf";
import { getDurationText } from "./duration";

import { getTimestampText, getUrlTimestamp } from "./timestamp";
import { parseUrl } from "../url-parser";
import { findFirstArg } from "../helpers";

const { BOT_USERNAME = "telegatimebot" } = process.env;
// dt stand for duration timestamp
const durationTimestampCommands = new Composer();
const COMMANDS = ["dt", "td"];

// Check for url argument. eg: /dt <url>
durationTimestampCommands.command(COMMANDS, async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  const replyArg = deunionize(ctx.message.reply_to_message);

  let messageText: string | undefined;
  let message_id: number | undefined;

  if (textArg) {
    messageText = textArg;
    message_id = ctx.message.message_id;
  } else if (replyArg?.text) {
    messageText = replyArg.text;
    message_id = replyArg.message_id;
  } else {
    // show an example
    return next();
  }

  if (!messageText) {
    return;
  }

  const parsedUrl = parseUrl(messageText);
  const messages: string[] = [];

  const timestamp = getUrlTimestamp(parsedUrl);

  try {
    const duration = await getDurationText(parsedUrl);
    messages.push(duration);

    if (timestamp) {
      messages.push(getTimestampText(timestamp));
    }
  } catch (error) {
    // if no timestamp - display duration error message to provide some feedback
    if (!timestamp && error instanceof Error) {
      return ctx.reply(error.message);
    }
  }

  const message = messages.join("\n");
  return ctx.reply(message, { reply_parameters: { message_id } });
});

// Fallback. Show an example. Called via next()
durationTimestampCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Get duration and convert timestamp. For example:");

  const myMotherToldMeUrl = "https://youtu.be/4dIiN57DQOI?t=4";
  const botMessage = await ctx.sendMessage(myMotherToldMeUrl);
  const { message_id } = botMessage;

  const stubbedDuration = "Duration: \u200c3:18\n";
  const stubbedTimestamp = "Timestamp: 0:04";

  await ctx.reply(command, { reply_parameters: { message_id } });

  await ctx.reply(stubbedDuration + stubbedTimestamp, {
    reply_parameters: { message_id },
  });
});

// Listen for bot name mentions. @telegatimebot is an alias /dt
// Defensive programming FTW!
durationTimestampCommands.mention(BOT_USERNAME, async (ctx) => {
  if (!ctx.message) {
    return;
  }
  const message = deunionize(ctx.message);

  const replyMessage = deunionize(message.reply_to_message);
  if (!replyMessage || !replyMessage.text) {
    return;
  }
  const { message_id } = replyMessage;

  const entities = replyMessage.entities;
  if (!entities) {
    return;
  }

  const firstUrl = entities.find((entity) => entity.type === "url");
  if (!firstUrl) {
    return;
  }

  const url = replyMessage.text.slice(firstUrl.offset, firstUrl.length);
  const parsedUrl = parseUrl(url);
  const texts: string[] = [];

  // Always include duration
  texts.push(await getDurationText(parsedUrl));

  // Explicit command call, don't check settings or user provided timestamp
  const timestamp = getUrlTimestamp(parsedUrl);
  if (timestamp) {
    texts.push(getTimestampText(timestamp));
  }

  const text = texts.join("\n");
  // return templateReply(ctx, text, replyMessage.message_id);
  return ctx.reply(text, { reply_parameters: { message_id } });
});

export default durationTimestampCommands;
