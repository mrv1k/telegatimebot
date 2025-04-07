import commands from "./commands";
import errorHandler from "./errors";
import { Hono } from "hono";
import { Telegraf } from "telegraf";
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
  // o
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
  // const youtube = configureYouTube(env);
  //
  // const bot = configureBot(env, youtube);
  // const path = `/telegraf/${bot.secretPathComponent()}`;
  // const telegaHook = await bot.createWebhook({
  //   domain: env.WEBHOOK_DOMAIN,
  //   path,
  // });

  const hono = new Hono();

  return (
    hono
      // .get(path, telegaHook)
      // .post(path, telegaHook)
      .get("/", (c) => c.text("mekmek"))
    //       .get("/", () => {
    //         res.setHeader("content-type", "text/plain").send(`\
    // TelegaTimeBot
    // Solves YouTube in Telegram annoyances by getting video duration and converting timestamp.
    // Add:
    // https://t.me/telegatimebot
    //
    // source: https://github.com/mrv1k/telegatimebot
    // `);
    //       })
    //       // TODO: figure out how to get the port?
    //       // TODO: port to Hono
    //       .listen(port, () => stayinAlive(port, env))
  );
}
const app = new Hono();

app.get("/", (c) => c.text("Hello Cloudflare Workers!"));

export default app;

// async function toProdOrNotToProd(thatIsTheQuestion: boolean) {
//   if (thatIsTheQuestion) {
//     await startProd();
//   } else {
//     // development, debug or others
//     bot.launch();
//     stayinAlive()
//   }
// }

const x = {
  async fetch(request, env, ctx): Promise<Response> {
    // process.env.NODE_ENV === 'production'
    const youtubeClient = configureYouTube(env);
    // TODO: give bot access to youtube via middleware
    configureBot(env, youtubeClient);

    return new Response("Hello Vutyorld!");
  },
} satisfies ExportedHandler<Env>;
