import { webhookCallback } from "grammy";
import { initBot } from ".";

export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    try {
      if (request.method === "POST") {
        console.log(request.url, request.method);
        const bot = initBot(env);

        // bot.api.setWebhook("https://dev.voronov.io");
        const cb = webhookCallback(bot, "cloudflare-mod");
        // bot.api.setWebhook("https://dev.voronov.io");
        const result = await cb(request);
        return result;
      }
    } catch (e) {
      if (e instanceof Error) {
        return new Response(e.message);
      }
    }

    return new Response("mekmek");
  },
} satisfies ExportedHandler<Env>;
