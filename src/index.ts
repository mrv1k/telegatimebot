import { Telegraf } from "telegraf";
import { useNewReplies } from "telegraf/future";
import commands from "./commands";
import type { ContextWithEnv } from "./envs";
import { parseDevEnv } from "./envs";
import errorHandler from "./errors";

export function configureBot(env: Env): Telegraf<ContextWithEnv> {
  const bot = new Telegraf<ContextWithEnv>(env.BOT_TOKEN);
  bot.use(useNewReplies());
  bot.catch(errorHandler);
  bot.use((ctx, next) => {
    ctx.env = env;
    next();
  });
  bot.use(commands);

  // Enable graceful stop & kill
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
  return bot;
}

async function startBotInDev() {
  const env = parseDevEnv();
  const bot = configureBot(env);

  if (process.env.NODE_ENV === "debug") {
    bot.use(Telegraf.log());
  }
  bot.launch();
}

const DEV_ENVS = ["dev", "development", "debug"];

if (DEV_ENVS.includes(process.env.NODE_ENV ?? "noop")) {
  startBotInDev();
}
