import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./errors";
import http from "http";
import { useNewReplies } from "telegraf/future";

const { BOT_TOKEN, BOT_USERNAME = "telegatimebot" } = process.env;
if (BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided");
}

if (process.env.NODE_ENV === undefined) {
  throw new TypeError("NODE_ENV must be specified");
}

process.title = BOT_USERNAME;

const bot = new Telegraf(BOT_TOKEN);
bot.use(useNewReplies());
bot.catch(errorHandler);
bot.use(commands);

if (process.env.NODE_ENV === "debug") {
  bot.use(Telegraf.log());
}


if (process.env.NODE_ENV === "production") {
  if (!process.env.WEBHOOK_DOMAIN) {
    throw new Error('"WEBHOOK_DOMAIN" env var is required!');
  }
  // https://telegraf.js.org/#md:webhooks
  bot
    .launch({
      webhook: {
        domain: process.env.WEBHOOK_DOMAIN,
        port: Number(process.env.PORT || 8080),
      },
    })
    .then(() => {
      console.log("I am ALIVE! in " + process.env.NODE_ENV);
    });
} else {
  bot.launch().then(() => console.log("dev launch yolo"));
}

// Enable graceful stop & kill
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// server is needed to keep bot alive?
http
  .createServer((_, res) => {
    res.writeHead(200);
    res.end(
      `\
TelegaTimeBot
Solves YouTube in Telegram annoyances by getting video duration and converting timestamp.
Add:
https://t.me/telegatimebot

source: https://github.com/mrv1k/telegatimebot
`,

    );
  })
  .listen(process.env.PORT || 8080);
