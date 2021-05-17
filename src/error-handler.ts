import { Context } from "telegraf";
import { YouTubeAPIError } from "./fetch-duration";

// TODO: Display user friend error messages
export default async function errorHandler(
  error: unknown,
  ctx: Context
): Promise<void> {
  // Follow order in which errors may occur
  if (error instanceof YouTubeAPIError) {
    ctx.reply(error.message);
  } else {
    process.exitCode = 1;
    console.error("Unhandled error while processing", ctx.update);
    ctx.reply("apologies, something broke");
    throw error;
  }
  // ⚠️ Always rethrow TimeoutError!
  // set exit code to emulate `warn-with-error-code` behavior of
  // https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  // to prevent a clean exit despite an error being thrown
}
