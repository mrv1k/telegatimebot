import { webhookCallback } from "grammy";
import { initBot } from ".";

// https://core.telegram.org/bots/webhooks#the-short-version
export default {
  async fetch(
    request: Request,
    env: Env,
    // ctx: ExecutionContext,
  ): Promise<Response> {
    console.log("reloaded");
    const token = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
    try {
      if (request.method === "POST") {
        console.log(request.url, request.method);
        const bot = await initBot(env);
        const cb = webhookCallback(bot, "cloudflare-mod", {
          onTimeout: (args) => {
            console.log("onTimeout", args);
            // debugger;
          },
          timeoutMilliseconds: 3000,
          secretToken: env.SECRET_TOKEN,
        });
        return cb(request);
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        return new Response(e.message);
      }
    }

    return new Response("mekmek");
  },
} satisfies ExportedHandler<Env>;
