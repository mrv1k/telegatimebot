import "dotenv/config";
import { Telegraf } from "telegraf";
import durationCommands from "./commands/duration";
import durationTimestampCommands from "./commands/duration-timestamp";
import settingsCommands from "./commands/settings";
import simpleCommands from "./commands/simple";
import timestampCommands from "./commands/timestamp";
import redis from "./core/redis";
import errorHandler from "./parts/error-handler";

const bot = new Telegraf(process.env.BOT_TOKEN);
process.title = process.env.BOT_USERNAME;

// Middleware
bot.catch(errorHandler);
if (process.env.NODE_ENV === "debug") bot.use(Telegraf.log());

bot.use(settingsCommands);
bot.use(simpleCommands);
bot.use(timestampCommands);
bot.use(durationCommands);
bot.use(durationTimestampCommands);

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => {
  redis.disconnect();
  bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
  redis.disconnect();
  bot.stop("SIGTERM");
});
