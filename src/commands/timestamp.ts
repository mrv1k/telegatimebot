import { Composer, deunionize } from "telegraf";
import { findFirstArg, templateReply } from "../helpers";
import { UrlParseError } from "../errors";
import { parseUrl } from "../url-parser";
import { formatTime, secondsToDuration } from "../time";

import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

export function getUrlTimestamp(parsedUrl: VideoInfo): number | undefined {
  const params = parsedUrl?.params;

  // url parser uses 0 if ?t param is found but failed to parse, ie: ?t=123a or ?t=-1
  if (params && typeof params.start === "number" && params.start > 0) {
    // start is timestamp
    return params.start;
  }
}

export function getUrlTimestampOrThrow(parsedUrl: VideoInfo): number {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) return parsed;
  throw new UrlParseError("Could not get timestamp");
}

export function getTimestampText(timestamp: number): string {
  const duration = secondsToDuration(timestamp);
  const timestampText = formatTime({ duration });
  return `Timestamp: ${timestampText}`;
}

const timestampCommands = new Composer();
const COMMANDS = ["t", "timestamp"];

// Check for url argument. eg: /timestamp <url>
timestampCommands.command(COMMANDS, (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) return next();

  const timestamp = getUrlTimestampOrThrow(parseUrl(textArg));
  const timestampText = getTimestampText(timestamp);
  return templateReply(ctx, timestampText, ctx.message.message_id);
});

// Check for reply. eg: /timestamp <reply_message>
timestampCommands.command(COMMANDS, (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) return next();

  const timestamp = getUrlTimestampOrThrow(parseUrl(replyArg.text));
  const timestampText = getTimestampText(timestamp);
  return templateReply(ctx, timestampText, replyArg.message_id);
});

// fallback, show an example
timestampCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Converts YouTube timestamp \nFor example:");

  const alrightThisIsCS50Url = "https://youtu.be/YoXxevp1WRQ?t=49";
  const botMessage = await templateReply(ctx, alrightThisIsCS50Url);

  await templateReply(ctx, command, botMessage.message_id);
  const stubbedTimestamp = "0:49";
  await templateReply(ctx, stubbedTimestamp, botMessage.message_id);
});

export default timestampCommands;
