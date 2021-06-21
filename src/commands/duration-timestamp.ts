import { Composer, deunionize } from "telegraf";
import { Settings } from "./settings";
import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  parseUrl,
} from "../core";
import { getSettingState } from "../core/redis";
import { templateReply } from "../parts/helpers";
import { hasNoUserTimestamp, YOUTUBE_URL } from "../parts/regexp";

// dt stand for duration timestamp
const dtCommands = new Composer();

dtCommands.command(["dt", "td"], async (ctx) => {
  ctx.reply("WIP");
});

// Listen for texts containing YouTube's url
dtCommands.url(YOUTUBE_URL, async (ctx) => {
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
dtCommands.mention(process.env.BOT_USERNAME, async (ctx) => {
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

export default dtCommands;
