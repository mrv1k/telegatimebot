import { Composer, deunionize } from "telegraf";
import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  parseUrl,
} from "../core";
import { getSettingState } from "../core/redis";
import {
  findFirstArg,
  hasNoUserTimestamp,
  templateReply,
  YOUTUBE_URL,
} from "./command-helpers";
import { Settings } from "./settings";

// dt stand for duration timestamp
const durationTimestampCommands = new Composer();
const COMMANDS = ["dt", "td", "durationtimestamp"];

durationTimestampCommands.command(COMMANDS, async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  const replyArg = deunionize(ctx.message.reply_to_message);

  let messageText: string | undefined;
  let replyMessageId: number | undefined;

  if (textArg) {
    messageText = textArg;
    replyMessageId = ctx.message.message_id;
  } else if (replyArg?.text) {
    messageText = replyArg.text;
    replyMessageId = replyArg.message_id;
  } else {
    // show an example
    next();
  }

  if (!messageText) return;

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
    if (!timestamp) {
      return templateReply(ctx, error.message, replyMessageId);
    }
  }

  const message = messages.join("\n");
  return templateReply(ctx, message, replyMessageId);
});

durationTimestampCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Get duration and convert timestamp \nFor example:");

  const myMotherToldMeUrl = "https://youtu.be/4dIiN57DQOI?t=4";
  const botMessage = await templateReply(ctx, myMotherToldMeUrl);

  const stubbedDuration = "Duration: \u200c3:18\n";
  const stubbedTimestamp = "Timestamp: 0:04";

  await templateReply(ctx, command, botMessage.message_id);
  await templateReply(
    ctx,
    stubbedDuration + stubbedTimestamp,
    botMessage.message_id
  );
});

// Listen for texts containing YouTube url
durationTimestampCommands.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) return;
  const id = ctx.chat.id;

  const timestampIsEnabled = await getSettingState(id, Settings.timestamp);
  const durationIsEnabled = await getSettingState(id, Settings.duration);

  const message = deunionize(ctx.message);

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);
  const texts: string[] = [];

  if (durationIsEnabled) {
    texts.push(await getDurationText(parsedUrl));
  }

  if (timestampIsEnabled && hasNoUserTimestamp(message.text)) {
    const timestamp = getUrlTimestamp(parsedUrl);
    if (timestamp) {
      texts.push(getTimestampText(timestamp));
    }
  }

  // Handle a case when duration is disabled and timestamp is not present
  if (texts.length !== 0) {
    const text = texts.join("\n");
    return templateReply(ctx, text, ctx.message.message_id);
  }
});

// Defensive programming FTW!
const { BOT_USERNAME = "telegatimebot" } = process.env;

durationTimestampCommands.mention(BOT_USERNAME, async (ctx) => {
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

  // Always include duration
  texts.push(await getDurationText(parsedUrl));

  // Explicit command call, don't check settings or user provided timestamp
  const timestamp = getUrlTimestamp(parsedUrl);
  if (timestamp) {
    texts.push(getTimestampText(timestamp));
  }

  const text = texts.join("\n");
  return templateReply(ctx, text, replyMessage.message_id);
});

export default durationTimestampCommands;
