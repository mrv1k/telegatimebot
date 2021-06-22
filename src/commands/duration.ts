import { Composer, deunionize } from "telegraf";
import { getDurationText, parseUrl } from "../core";
import { findFirstArg, templateReply } from "./command-helpers";

const COMMANDS = ["d", "duration"];
const durationCommands = new Composer();

// Check for url argument. eg: /duration <url>
durationCommands.command(COMMANDS, async (ctx, next) => {
  const textArg = findFirstArg(ctx.message.text);
  if (!textArg) return next();

  const duration = await getDurationText(parseUrl(textArg));
  templateReply(ctx, duration, ctx.message.message_id);
});

// Check for reply. eg: /duration <reply_message>
durationCommands.command(COMMANDS, async (ctx, next) => {
  const replyArg = deunionize(ctx.message.reply_to_message);
  if (!replyArg || !replyArg.text) return next();

  const duration = await getDurationText(parseUrl(replyArg.text));
  if (duration) {
    templateReply(ctx, duration, replyArg.message_id);
  }
});

// Fallback. Show an example
durationCommands.command(COMMANDS, async (ctx) => {
  await ctx.reply("Gets YouTube video duration. \nFor example:");
  const command = ctx.message.text;
  const rickUrl = "https://youtu.be/oHg5SJYRHA0";
  const botMessage = await ctx.reply(`${command} ${rickUrl}`, {
    disable_web_page_preview: true,
    disable_notification: true,
  });
  // stub API call for the example, for explanation on format go to #getDurationText
  const stubbedDuration = `Duration: \u200c3:33`;
  templateReply(ctx, stubbedDuration, botMessage.message_id);
});

export default durationCommands;
