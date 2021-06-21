import { Composer, deunionize } from "telegraf";

import { getTimestampText, getUrlTimestampOrThrow, parseUrl } from "../core";
import { templateReply, findFirstArg } from "../parts/helpers";

const timestampCommands = new Composer();

timestampCommands.command(["t", "timestamp"], async (ctx) => {
  const textArg = findFirstArg(ctx.message.text);
  if (textArg) {
    const timestamp = getUrlTimestampOrThrow(parseUrl(textArg));
    const timestampText = getTimestampText(timestamp);
    return templateReply(ctx, timestampText, ctx.message.message_id);
  }

  const replyArg = deunionize(ctx.message.reply_to_message);
  if (replyArg && replyArg.text) {
    const timestamp = getUrlTimestampOrThrow(parseUrl(replyArg.text));
    const timestampText = getTimestampText(timestamp);
    return templateReply(ctx, timestampText, replyArg.message_id);
  }

  // else show an example
  const command = ctx.message.text;
  return ctx.reply(`${command} link?timestamp=666`);
});

export default timestampCommands;
