import {
  Composer,
  Context,
  deunionize,
  MiddlewareFn,
  NarrowedContext,
} from "telegraf";
import { Update } from "telegraf/typings/core/types/typegram";
import { getDurationText, parseUrl } from "../core";
import { findFirstArg, templateReply } from "./command-helpers";

const durationCommands = new Composer();
const COMMANDS = ["d", "duration"];

type TextContext = NarrowedContext<Context, Update.MessageUpdate> & {
  message: { text: string };
};

const textDurationMiddleware: MiddlewareFn<TextContext> = async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) return next();

  const duration = await getDurationText(parseUrl(textArg));
  return templateReply(ctx, duration, ctx.message.message_id);
};

// Check for url argument. eg: /duration <url>
durationCommands.command(COMMANDS, textDurationMiddleware);

// Check for reply. eg: /duration <reply_message>
durationCommands.command(COMMANDS, async (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) return next();

  const duration = await getDurationText(parseUrl(replyArg.text));
  templateReply(ctx, duration, replyArg.message_id);
});

// Fallback. Show an example
durationCommands.command(COMMANDS, async (ctx) => {
  const command = ctx.message.text;

  await ctx.reply("Gets YouTube duration \nFor example:");

  const rickUrl = "https://youtu.be/oHg5SJYRHA0";
  const botMessage = await ctx.reply(`${command} ${rickUrl}`, {
    disable_web_page_preview: true,
    disable_notification: true,
  });
  // Stub API call for the example. Telegram ignores timestamps for when page preview is disabled. No need for unicode char
  const stubbedDuration = `Duration: 3:33`;
  templateReply(ctx, stubbedDuration, botMessage.message_id);
});

export default durationCommands;
