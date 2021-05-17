import type Context from "telegraf/typings/context";
import type { Message } from "telegraf/typings/core/types/typegram";

export function findFirstArg(text: string): string | undefined {
  const parts = text.split(/ +/);
  if (parts.length === 1) return;
  return parts[1];
}

// Ideally, I'd like to pass reply function in, but the its type is not exposed so to safe myself some pain, pass in whole Context
export const templateReply = (
  ctx: Context,
  text: string,
  replyId?: number
): Promise<Message.TextMessage> =>
  ctx.reply(text, { reply_to_message_id: replyId, disable_notification: true });
