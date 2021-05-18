import { Composer, Markup } from "telegraf";
import redis from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

settingsCommands.hears(["Ah", "ha", "ha", "ha", "A"], async (ctx) => {
  console.log(ctx.chat);
  console.log(ctx.chat.id);

  await redis.setex("temp", 20, "BRUH");
  console.log("ah ha ha ha");
});
settingsCommands.hears(["stayin", "alive", "Alive", "B"], async (ctx) => {
  console.log("stayin alive", await redis.get("foo"));
});

const word = (setting: boolean) => (setting ? "Disable" : "Enable");

settingsCommands.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Disable all", "disable_all")],
      [
        // Markup.button.callback(
        //   `${word(tempSettings.duration)} duration`,
        //   "toggle_duration"
        // ),
        // Markup.button.callback(
        //   `${word(tempSettings.timestamp)} timestamp`,
        //   "toggle_timestamp"
        // ),
      ],
    ]),
  });
});

settingsCommands.action("disable_all", (ctx) => {
  console.log("disable_all");
  // tempSettings.duration = false;
  // tempSettings.timestamp = false;
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_duration", (ctx) => {
  // tempSettings.duration = !tempSettings.duration;
  console.log("toggle_duration", ctx);
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_timestamp", (ctx) => {
  // tempSettings.timestamp = !tempSettings.timestamp;
  console.log("toggle_timestamp", ctx);
  ctx.answerCbQuery();
});

export default settingsCommands;
export { redis };
