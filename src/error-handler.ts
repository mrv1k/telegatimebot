import { Context } from "telegraf";

// TODO: Display user friend error messages
export default async function errorHandler(
  error: unknown,
  ctx: Context
): Promise<void> {
  // "¯\\_(ツ)_/¯ It's a live stream";
  console.log("caught!", error);
  ctx.reply("apologies, something broke");
}
