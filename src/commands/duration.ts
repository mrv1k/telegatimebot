import { Composer, deunionize } from "telegraf";
import { parseUrl } from "../url-parser";
import { findFirstArg } from "../helpers";
import { fetchDuration } from "../youtube-api";
import { formatTime } from "../time";

import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

const durationCommands = new Composer();
const COMMANDS = ["d", "duration"];

export async function getDurationText(parsedUrl: VideoInfo): Promise<string> {
  const duration = await fetchDuration(parsedUrl.id);
  // Use \u200c (ZERO WIDTH NON-JOINER) to prevent Telegram from making it a timestamp
  return `Duration: \u200c${formatTime(duration)}`;
}

// Check for url argument. eg: /duration <url>
durationCommands.command(COMMANDS, async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) {
    return next();
  }
  const { message_id } = ctx.message;

  const duration = await getDurationText(parseUrl(textArg));
  return ctx.reply(duration, { reply_parameters: { message_id } });
});

// Check for reply. eg: /duration <reply_message>
durationCommands.command(COMMANDS, async (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) {
    return next();
  }
  const { message_id } = replyArg;

  const duration = await getDurationText(parseUrl(replyArg.text));
  return ctx.reply(duration, { reply_parameters: { message_id } });
});

// Fallback. Show an example. Called via next()
durationCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Gets YouTube duration \nFor example:");

  const rickUrl = "https://youtu.be/oHg5SJYRHA0";
  const botMessage = await ctx.sendMessage(`${command} ${rickUrl}`, {
    link_preview_options: { is_disabled: true },
  });
  const { message_id } = botMessage;

  // Stub API call for the example. Telegram ignores timestamps when page
  // preview is disabled. No need for unicode char
  const stubbedDuration = `Duration: 3:33`;

  return ctx.reply(stubbedDuration, { reply_parameters: { message_id } });
});

export default durationCommands;
