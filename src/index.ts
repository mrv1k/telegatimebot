import { Bot } from "grammy";
import { Composer } from "grammy";
// import durationTimestampCommands from "./commands/duration-timestamp";
// import spy from "./commands/spy";
// import timestampCommands from "./commands/timestamp";
import { useSimpleCommands } from "./commands/simple-commands";

import type { Context } from "grammy";
import { useDurationCommands } from "./commands/duration";
import { errorHandler } from "./errors";

export interface TTBContext extends Context {
  env: Env;
}
export type TTBComposer = Composer<TTBContext>;

export function initBot(env: Env) {
  const bot = new Bot<TTBContext>(env.BOT_TOKEN, {
    botInfo: {
      id: 1605965329,
      is_bot: true,
      first_name: "Mrv1kbot",
      username: "mrv1kbot",
      can_join_groups: true,
      can_read_all_group_messages: false,
      supports_inline_queries: false,
      can_connect_to_business: false,
      has_main_web_app: false,
    },
  });

  const composer = new Composer<TTBContext>().use((ctx, next) => {
    ctx.env = env;
    next();
  });

  bot.catch(errorHandler);

  useSimpleCommands(composer);
  useDurationCommands(composer);

  // bot.use(timestampCommands);
  // bot.use(durationTimestampCommands);
  // bot.use(spy);

  bot.use(composer);
  return bot;
}
