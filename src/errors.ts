import { Context } from "telegraf";

export default async function errorHandler(
  error: unknown,
  ctx: Context,
): Promise<void> {
  if (error instanceof NoopError) {
    // do nothing
    return;
  }

  // Follow order in which errors may occur
  if (
    error instanceof YouTubeAPIError ||
    error instanceof UrlParseError ||
    error instanceof TimeError
  ) {
    ctx.reply(error.message);
    return;
  }

  process.exitCode = 1;
  // console.error("Unhandled error while processing", error);
  // console.log("broken by", ctx.update);
  ctx.reply("Ouch. Something inside me just broke");
  process.kill(process.pid, "SIGINT");

  // WARNING: Always rethrow TimeoutError!
  // set exit code to emulate `warn-with-error-code` behavior of
  // https://nodejs.org/api/cli.html#cli_unhandled_rejections_mode
  // to prevent a clean exit despite an error being thrown
  throw error;
}

class YouTubeAPIError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = "YouTubeAPIError";
    if (stack) {
      this.stack = stack;
    }
  }
}

class TimeError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = "TimeError";
    if (stack) {
      this.stack = stack;
    }
  }
}

class UrlParseError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = "UrlParseError";
    if (stack) {
      this.stack = stack;
    }
  }
}

class NoopError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = "NoopError";
    if (stack) {
      this.stack = stack;
    }
  }
}

export { YouTubeAPIError, TimeError, UrlParseError, NoopError };
