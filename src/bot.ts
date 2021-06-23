import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./core/error-handler";
import redis from "./core/redis";

const bot = new Telegraf(process.env.BOT_TOKEN);
process.title = process.env.BOT_USERNAME;

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
