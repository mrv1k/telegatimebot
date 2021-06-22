import { Composer, deunionize } from "telegraf";
import { getTimestampText, getUrlTimestampOrThrow, parseUrl } from "../core";
import { findFirstArg, templateReply } from "./command-helpers";

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
  await templateReply(ctx, "0:49", botMessage.message_id);
});

export default timestampCommands;
