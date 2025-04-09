import { config } from "dotenv";
import path from "node:path";
import type { Context } from "telegraf";

export interface ContextWithEnv extends Context {
  env: Env;
}

export function parseDevEnv(): Env {
  config({ path: path.resolve(process.cwd(), ".env") });
  const { BOT_TOKEN, BOT_USERNAME, YOUTUBE_API_KEY } = process.env;

  // needed for any env
  if (BOT_TOKEN === undefined) {
    throw new TypeError("BOT_TOKEN must be provided");
  }
  if (YOUTUBE_API_KEY === undefined) {
    throw new TypeError("YOUTUBE_API_KEY must be provided!");
  }

  // needed for dev
  if (process.env.NODE_ENV === undefined) {
    throw new TypeError("NODE_ENV must be specified");
  }
  if (BOT_USERNAME) {
    process.title = BOT_USERNAME;
  }

  return {
    BOT_TOKEN,
    BOT_USERNAME: "telegatimebot",
    YOUTUBE_API_KEY,
    WEBHOOK_DOMAIN: "stub",
    SECRET_ID: "stub",
  };
}
