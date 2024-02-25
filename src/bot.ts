import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./core/error-handler";
import http from "http";

const { BOT_TOKEN, BOT_USERNAME = "telegatimebot" } = process.env;
if (BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided");
}
process.title = BOT_USERNAME;

const bot = new Telegraf(BOT_TOKEN);

if (process.env.NODE_ENV === "debug") {
  bot.use(Telegraf.log());
}

bot.catch(errorHandler);
bot.use(commands);

bot.launch();
console.log("I am ALIVE!");

// Enable graceful stop & kill
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// server is needed to keep replit alive
const server = http.createServer((_, res) => {
  res.writeHead(200);
  res.end("Ah, ha, ha, ha, stayin' alive");
});

server.listen(process.env.PORT || 8080);
