const {
  BOT_TOKEN,
  BOT_USERNAME = "telegatimebot",
  YOUTUBE_API_KEY,
} = process.env;


// prod vars
const PORT = Number(process.env.PORT) || 8080

if (BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided");
}
if (YOUTUBE_API_KEY === undefined) {
  throw new TypeError("YOUTUBE_API_KEY must be provided!");
}

if (process.env.WEBHOOK_DOMAIN === undefined) {
  throw new TypeError("NODE_ENV must be specified");
}


// dev vars
if (process.env.NODE_ENV === undefined) {
  throw new TypeError("NODE_ENV must be specified");
}
process.title = BOT_USERNAME;

process.env.WEBHOOK_DOMAIN,
