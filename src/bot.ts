import "dotenv/config";
import { Telegraf } from "telegraf";
import commands from "./commands";
import errorHandler from "./errors";
import { useNewReplies } from "telegraf/future";
import { fastify } from "fastify";

const { BOT_TOKEN, BOT_USERNAME = "telegatimebot" } = process.env;
if (BOT_TOKEN === undefined) {
  throw new TypeError("BOT_TOKEN must be provided");
}

if (process.env.NODE_ENV === undefined) {
  throw new TypeError("NODE_ENV must be specified");
}

process.title = BOT_USERNAME;

const bot = new Telegraf(BOT_TOKEN);
bot.use(useNewReplies());
bot.catch(errorHandler);
bot.use(commands);
// Enable graceful stop & kill
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

if (process.env.NODE_ENV === "debug") {
  bot.use(Telegraf.log());
}


// bot1817589905
const go = async () => {
  // const app = fastify();

  const WEBHOOK_DOMAIN='https://telegatimebot-6369c39fac19.herokuapp.com'
  // const webhook = await bot.createWebhook({ domain: WEBHOOK_DOMAIN });
  console.log('mek', `/telegraf/${bot.secretPathComponent()}`, 'port', process.env.PORT)

//   app
//   //   .post(`/telegraf/${bot.secretPathComponent()}`, (req, rep, ...rest) => {
//   //   console.log(req, rep, ...rest)
//   //   // return webhook(req.raw, rep.raw)
//   // })
//   .get('/', (...rest) => {
//       console.log(rest)
//      return `\
// TelegaTimeBot
// Solves YouTube in Telegram annoyances by getting video duration and converting timestamp.
// Add:
// https://t.me/telegatimebot
//
// source: https://github.com/mrv1k/telegatimebot
// `;
//     })
//     .listen({ port: Number(process.env.PORT || 8080) })
//     .then(() => console.log("Listening on port", Number(process.env.PORT || 8080)));
  // app.post(`/telegraf/${bot.secretPathComponent()}`, webhook);

  // app.post(`/telegraf/${bot.secretPathComponent()}`, async (...rest) => {
  //   webhook()
  // });

  bot
    .launch({
      webhook: {
        domain: WEBHOOK_DOMAIN,
        port: Number(process.env.PORT || 8080),
        // path: '/bot'
        // Optional path to listen for.
        // `bot.secretPathComponent()` will be used by default
        // path: webhookPath,

        // Optional secret to be sent back in a header for security.
        // e.g.: `crypto.randomBytes(64).toString("hex")`
        // secretToken: randomAlphaNumericString,
      },
    })
    .then(() => {
      console.log("I am ALIVE! in " + process.env.NODE_ENV);
    });
  //
  //
  // app
    // .listen({ port: Number(process.env.PORT || 8080) })
    // .then(() => console.log("Listening on port", port));
}
go()
