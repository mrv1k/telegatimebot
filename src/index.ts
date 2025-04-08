import commands from "./commands";
import errorHandler from "./errors";
import { Telegraf } from "telegraf";
import { parseEnv } from "./envs";
import { useNewReplies } from "telegraf/future";
import { youtube } from "@googleapis/youtube";

import type { youtube_v3 } from "@googleapis/youtube";

type Youtube = youtube_v3.Youtube;

function configureBot(env: Env, youtubeClient: Youtube) {
  const bot = new Telegraf(env.BOT_TOKEN);

  bot.use(useNewReplies());
  bot.catch(errorHandler);
  bot.use(commands);

  // Enable graceful stop & kill
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  // if (env.??? === "debug") {
  //   bot.use(Telegraf.log());
  // }
  return bot;
}

function configureYouTube(env: Env) {
  return youtube({
    version: "v3",
    auth: env.YOUTUBE_API_KEY,
  });
}

function stayinAlive(env: Env) {
  console.log(`I'm stayin ALIVE in ${env} on port ${env}`);
}

async function startProd(env: Env) {
  const youtube = configureYouTube(env);
  const bot = configureBot(env, youtube);
  // const path = `/telegraf/${bot.secretPathComponent()}`;
  // const telegaHook = await bot.createWebhook({
  //   domain: env.WEBHOOK_DOMAIN,
  //   path,
  // });

  // .get(path, telegaHook)
  // .post(path, telegaHook)
  return;
}

function startDev(env: Env) {
  const youtube = configureYouTube(env);
  const bot = configureBot(env, youtube);
  bot.launch();
}

async function toProdOrNotToProd(thatIsTheQuestion: boolean = true) {
  const env = parseEnv({});
  if (thatIsTheQuestion) {
    await startProd(env);
  } else {
    // development, debug or others
    startDev(env);
  }
  // stayinAlive();
}

toProdOrNotToProd(false);
