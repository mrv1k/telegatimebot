import commands from "./commands";
import errorHandler from "./errors";
import express from 'express';
import { Telegraf } from "telegraf";
import { useNewReplies } from "telegraf/future";
import { youtube } from "@googleapis/youtube";

function configureBot(env: Env, youtubeClient: any) {
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
  return bot
}

function configureYouTube(env: Env) {
  return youtube({
    version: "v3",
    auth: env.YOUTUBE_API_KEY
  });
}

function stayinAlive(env: Env) {
  console.log(`I'm stayin ALIVE in ${env} on port ${env}`);
}

async function startProd(env: Env) {
  const youtube = configureYouTube(env)

  const bot = configureBot(env, youtube);
  const path = `/telegraf/${bot.secretPathComponent()}`;
  const telegaHook = await bot.createWebhook({
    domain: env.WEBHOOK_DOMAIN,
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
    .listen(port, () => stayinAlive(port, env));
};

// async function toProdOrNotToProd(thatIsTheQuestion: boolean) {
//   if (thatIsTheQuestion) {
//     await startProd();
//   } else {
//     // development, debug or others
//     bot.launch();
//     stayinAlive()
//   }
// }

export default {
  async fetch(request, env, ctx): Promise<Response> {
    // process.env.NODE_ENV === 'production'
    const youtubeClient = configureYouTube(env)
    configureBot(env, youtubeClient)

    return new Response('Hello Vutyorld!');
  },
} satisfies ExportedHandler<Env>;
