import { Telegraf } from "telegraf";
import { useNewReplies } from "telegraf/future";
import commands from "./commands";
import type { ContextWithEnv } from "./envs";
import { parseEnv } from "./envs";
import errorHandler from "./errors";

function configureBot(env: Env) {
  const bot = new Telegraf<ContextWithEnv>(env.BOT_TOKEN);

  // built in middleware
  bot.use(useNewReplies());

  // my middleware
  bot.catch(errorHandler);
  bot.use((ctx, next) => {
    ctx.env = env;
    next();
  });
  bot.use(commands);

  // Enable graceful stop & kill
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  // if (env.??? === "debug") {
  //   bot.use(Telegraf.log());
  // }
  return bot;
}

function stayinAlive(env: Env) {
  console.log(`I'm stayin ALIVE in ${env} on port ${env}`);
}

async function startProd(env: Env) {
  const bot = configureBot(env);
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
  const bot = configureBot(env);
  bot.launch();
}

async function toProdOrNotToProd(thatIsTheQuestion: boolean = true) {
  const env = parseEnv();

  if (thatIsTheQuestion) {
    await startProd(env);
  } else {
    // development, debug or others
    startDev(env);
  }
  // stayinAlive();
}

toProdOrNotToProd(false);
