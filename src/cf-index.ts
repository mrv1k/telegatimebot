import { Context, webhookCallback } from "grammy";
import { configureBot } from ".";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    const bot = configureBot(env);
    bot.command("prod", async (ctx: Context) => {
      await ctx.reply("prod");
    });
    const x = webhookCallback(bot, "cloudflare-mod")(request);
    return x;
  },
} satisfies ExportedHandler<Env>;
