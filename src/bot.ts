import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./core/error-handler";
import redis from "./core/redis";
import "./server"; // only needed to keep the bot alive

const { BOT_TOKEN, BOT_USERNAME = "telegatimebot" } = process.env;
if (BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided");
}
process.title = BOT_USERNAME;

const bot = new Telegraf(BOT_TOKEN);

if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());
bot.catch(errorHandler);
bot.use(commands);

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  redis.disconnect();
});

// Enable graceful kill
process.once("SIGTERM", () => {
  bot.stop("SIGTERM");
  redis.disconnect();
});
