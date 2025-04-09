import { config } from "dotenv";
import path from "node:path";
import type { Context } from "telegraf";

export interface ContextWithEnv extends Context {
  env: Env;
}

export function parseEnv(rawEnv?: unknown): Env {
  // if (rawEnv === undefined) {
  // }
  config({ path: path.resolve(process.cwd(), ".env") });
  const { BOT_TOKEN, BOT_USERNAME, YOUTUBE_API_KEY } = process.env;

  console.log(process.env);

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

  // needed for prod
  // if (process.env.WEBHOOK_DOMAIN === undefined) {
  //   throw new TypeError("NODE_ENV must be specified");
  // }

  // const PORT = Number(process.env.PORT) || 8080;
  // process.env.WEBHOOK_DOMAIN;
}

console.log(
  parseEnv({
    BOT_TOKEN: "a",
    BOT_USERNAME: "b",
    YOUTUBE_API_KEY: "c",
    WEBHOOK_DOMAIN: "d",
    SECRET_ID: "e",
  }),
);
