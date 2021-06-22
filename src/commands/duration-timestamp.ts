import { Composer, deunionize } from "telegraf";
import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  parseUrl,
} from "../core";
import { getSettingState } from "../core/redis";
import {
  hasNoUserTimestamp,
  templateReply,
  YOUTUBE_URL,
} from "./command-helpers";
import { Settings } from "./settings";

// dt stand for duration timestamp
const durationTimestampCommands = new Composer();

durationTimestampCommands.command(["dt", "td"], async (ctx) => {
  ctx.reply("WIP");
});

// Listen for texts containing YouTube's url
durationTimestampCommands.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) return;
  const id = ctx.chat.id;

  const timestampIsEnabled = await getSettingState(id, Settings.timestamp);
  const durationIsEnabled = await getSettingState(id, Settings.duration);

  if (!timestampIsEnabled && !durationIsEnabled) return;

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

  const text = texts.join("\n");
  return templateReply(ctx, text, ctx.message.message_id);
});

// Defensive programming FTW!
durationTimestampCommands.mention(process.env.BOT_USERNAME, async (ctx) => {
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
