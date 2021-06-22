import type Context from "telegraf/typings/context";
import type { Message } from "telegraf/typings/core/types/typegram";

const findFirstArg = (text: string): string | undefined => {
  const parts = text.split(/ +/);
  if (parts.length === 1) return;
  return parts[1];
};

// Ideally, I'd like to pass only #reply function in, but doing that loses function type.
// Solution: pass in entire Context to avoid a headache.
const templateReply = (
  ctx: Context,
  text: string,
  replyId?: number
): Promise<Message.TextMessage> =>
  ctx.reply(text, { reply_to_message_id: replyId, disable_notification: true });

// Match youtube or youtu.be; tests - https://regexr.com/5sve6
const YOUTUBE_URL = /youtu(\.)?be/;

// Match anything between 0:00 to 99:99:99; Tests - https://regexr.com/5t1ib
const TELEGRAM_TIMESTAMP = /(\d{1,2}:\d{1,2}(?::\d{1,2})?)/;

const hasNoUserTimestamp = (text = ""): boolean =>
  TELEGRAM_TIMESTAMP.test(text) === false;

export { YOUTUBE_URL, hasNoUserTimestamp, templateReply, findFirstArg };
