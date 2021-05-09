require("dotenv").config();

const { Telegraf } = require("telegraf");

const fetchDuration = require("./fetchDuration");

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Welcome"));
bot.help((ctx) => ctx.reply("WIP"));
bot.on("sticker", async (ctx) => {
  const duration = await fetchDuration();
  ctx.reply(`Video length is ${duration.minutes}`);
});
bot.hears("hi", (ctx) => ctx.reply("Hey there"));
bot.launch();

console.log("I am ALIVE!");

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
