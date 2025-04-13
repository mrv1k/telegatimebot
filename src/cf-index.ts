import { Bot, Context, webhookCallback } from "grammy";
import { configureBot } from ".";
import { registerSimpleCommands } from "./commands/simple-commands";
import durationCommands from "./commands/duration";
import type { ContextWithEnv } from "./envs";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      console.log(request.url, request.method);
      const bot = new Bot<ContextWithEnv>(
        "1605965329:AAEbXreG5IPlsL2dyyEBVM2AJ0t2uDdA26Y",
        {
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
        },
      );

      bot.use((ctx, next) => {
        ctx.env = env;
        next();
      });
      bot.api.setWebhook(
        "https://hong-continually-scanning-next.trycloudflare.com/",
      );
      bot.use(durationCommands);

      registerSimpleCommands(bot);

      const cb = webhookCallback(bot, "cloudflare-mod");
      const result = await cb(request);
      return result;
    } catch (e) {
      return new Response(e.message);
    }
  },
} satisfies ExportedHandler<Env>;
