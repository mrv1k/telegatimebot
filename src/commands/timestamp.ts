import { Composer, deunionize } from "telegraf";
import { findFirstArg } from "../helpers";
import { UrlParseError } from "../errors";
import { parseUrl } from "../url-parser";
import { formatTime, secondsToDuration } from "../time";

import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

const timestampCommands = new Composer();
const COMMANDS = ["t", "timestamp"];

export function getUrlTimestamp(parsedUrl: VideoInfo): number | undefined {
  const params = parsedUrl?.params;

  // url parser uses 0 if ?t param found but failed to parse ie: ?t=123a or ?t=-1
  // start is timestamp
  if (params && typeof params.start === "number" && params.start > 0) {
    return params.start;
  }
}

export function getUrlTimestampOrThrow(parsedUrl: VideoInfo): number {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) {
    return parsed;
  }
  throw new UrlParseError("Could not get timestamp");
}

export function getTimestampText(timestamp: number): string {
  const duration = secondsToDuration(timestamp);
  const timestampText = formatTime({ duration });
  return `Timestamp: ${timestampText}`;
}

// Check for url argument. eg: /timestamp <url>
timestampCommands.command(COMMANDS, (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) {
    return next();
  }
  const { message_id } = ctx.message;

  const timestamp = getUrlTimestampOrThrow(parseUrl(textArg));
  const timestampText = getTimestampText(timestamp);
  return ctx.reply(timestampText, { reply_parameters: { message_id } });
});

// Check for reply. eg: /timestamp <reply_message>
timestampCommands.command(COMMANDS, (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) {
    return next();
  }
  const { message_id } = replyArg;

  const timestamp = getUrlTimestampOrThrow(parseUrl(replyArg.text));
  const timestampText = getTimestampText(timestamp);
  return ctx.reply(timestampText, { reply_parameters: { message_id } });
});

// Fallback. Show an example. Called via next()
timestampCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Converts YouTube timestamp \nFor example:");

  const alrightThisIsCS50Url = "https://youtu.be/YoXxevp1WRQ?t=49";
  const botMessage = await ctx.sendMessage(alrightThisIsCS50Url);
  const { message_id } = botMessage;

  await ctx.reply(command, { reply_parameters: { message_id } });
  const stubbedTimestamp = "0:49";
  await ctx.reply(stubbedTimestamp, { reply_parameters: { message_id } });
});

export default timestampCommands;
