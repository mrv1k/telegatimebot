import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./errors";
import { useNewReplies } from "telegraf/future";
import express from 'express';

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

// Enable graceful stop & kill
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

if (process.env.NODE_ENV === "debug") {
  bot.use(Telegraf.log());
}

function stayinAlive() {
  const port = Number(process.env.PORT) || 8080
  console.log(`I'm stayin ALIVE in ${process.env.NODE_ENV} on port ${port}`);
}

async function startProd() {
  if (process.env.WEBHOOK_DOMAIN === undefined) {
    throw new TypeError("NODE_ENV must be specified");
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn('This is intented for production, getting it working locally needs webhook setup')
  }

  const path = `/telegraf/${bot.secretPathComponent()}`;
  const telegaHook = await bot.createWebhook({
    domain: process.env.WEBHOOK_DOMAIN,
    path,
  });

  return express()
    .get(path, telegaHook)
    .post(path, telegaHook)
    .get("/mek", (_, res) => res.type("text").send("mekmek"))
    .get("/", (_, res) => {
      res.setHeader("content-type", "text/plain").send(`\
TelegaTimeBot
Solves YouTube in Telegram annoyances by getting video duration and converting timestamp.
Add:
https://t.me/telegatimebot

source: https://github.com/mrv1k/telegatimebot
`);
    })
    .listen(Number(process.env.PORT) || 8080, stayinAlive);
};


if (process.env.NODE_ENV === 'production') {
  startProd();
} else {
  // development, debug or others
  bot.launch();
  stayinAlive()
}
