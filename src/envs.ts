import "dotenv/config";

export function parseEnv(data: unknown) {
  const {
    BOT_TOKEN,
    BOT_USERNAME = "telegatimebot",
    YOUTUBE_API_KEY,
  } = process.env;

  // needed for any env
  if (BOT_TOKEN === undefined) {
    throw new TypeError("BOT_TOKEN must be provided");
  }
  if (YOUTUBE_API_KEY === undefined) {
    throw new TypeError("YOUTUBE_API_KEY must be provided!");
  }
  process.title = BOT_USERNAME;

  // needed for dev
  if (process.env.NODE_ENV === undefined) {
    throw new TypeError("NODE_ENV must be specified");
  }

  // needed for prod
  // if (process.env.WEBHOOK_DOMAIN === undefined) {
  //   throw new TypeError("NODE_ENV must be specified");
  // }

  // const PORT = Number(process.env.PORT) || 8080;
  // process.env.WEBHOOK_DOMAIN;
}
