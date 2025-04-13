import { Bot } from "grammy";
// import durationCommands from "./commands/duration";
// import durationTimestampCommands from "./commands/duration-timestamp";
// import spy from "./commands/spy";
// import timestampCommands from "./commands/timestamp";
import type { ContextWithEnv } from "./envs";
import { parseDevEnv } from "./envs";
// import errorHandler from "./errors";
import { registerSimpleCommands } from "./commands/simple-commands";

export type BotWithContext = Bot<ContextWithEnv>;

export function configureBot(env: Env) {
  const bot = new Bot<ContextWithEnv>(env.BOT_TOKEN, {
    botInfo: {
      id: 1817589905,
      is_bot: true,
      first_name: "TelegaTimeBot",
      username: "telegatimebot",
      can_join_groups: true,
      can_read_all_group_messages: true,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
    },
  });

  bot.use((ctx, next) => {
    ctx.env = env;
    next();
  });

  // bot.catch(errorHandler);

  registerSimpleCommands(bot);

  // bot.use(timestampCommands);
  // bot.use(durationCommands);
  // bot.use(durationTimestampCommands);
  // bot.use(spy);
  return bot;
}

async function startBotInDev() {
  const env = parseDevEnv();
  const bot = configureBot(env);

  // if (process.env.NODE_ENV === "debug") {
  //   bot.use(Telegraf.log());
  // }
  bot.start();

  // Enable graceful stop & kill for long polling
  process.once("SIGINT", () => bot.stop());
  process.once("SIGTERM", () => bot.stop());
}

const DEV_ENVS = ["dev", "development", "debug"];
const nodeEnv = process.env.NODE_ENV ?? "noop";

if (DEV_ENVS.includes(nodeEnv)) {
  console.log(nodeEnv, "started in dev");
  startBotInDev();
}
