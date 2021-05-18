import { Composer, Markup } from "telegraf";
import redis, { redisKey } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

export enum Settings {
  timestamp = "timestamp",
  duration = "duration",
}

const word = (setting: boolean) => (setting ? "Disable" : "Enable");

settingsCommands.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Disable all", "disable_all")],
      [
        Markup.button.callback(`${"toggle"} duration`, "toggle_duration"),
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

settingsCommands.action("toggle_duration", async (ctx) => {
  if (!ctx.chat) return;
  console.log(ctx.chat);
  console.log(ctx.chat.id);

  const key = redisKey(ctx.chat.id, Settings.duration);
  console.log(key);

  const exists = await redis.exists(key);
  console.log(exists);

  if (exists) {
    await redis.del(key);
  } else {
    await redis.set(key, 1);
  }

  // console.log("toggle_duration", ctx);
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_timestamp", (ctx) => {
  // tempSettings.timestamp = !tempSettings.timestamp;
  console.log("toggle_timestamp", ctx);
  ctx.answerCbQuery();
});

export default settingsCommands;
export { redis };
