import { Composer, Markup } from "telegraf";
import redis, { redisKey } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

export enum Settings {
  timestamp = "timestamp",
  duration = "duration",
}

settingsCommands.settings(async (ctx) => {
  if (!ctx.chat) return;
  const id = ctx.chat.id;

  const durationIsOn = await isDurationOn(id);
  const durationText = `${emoji(durationIsOn)} duration`;

  const timestampIsOn = await isTimestampOn(id);
  const timestampText = `${emoji(timestampIsOn)} timestamp`;

  ctx.replyWithHTML("Settings", {
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback(durationText, "toggle_duration"),
        Markup.button.callback(timestampText, "toggle_timestamp"),
      ],
    ]),
  });
});

settingsCommands.action("toggle_duration", async (ctx) => {
  if (!ctx.chat) return;
  const key = redisKey(ctx.chat.id, Settings.duration);
  toggle(key);
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_timestamp", (ctx) => {
  if (!ctx.chat) return;
  const key = redisKey(ctx.chat.id, Settings.timestamp);
  toggle(key);
  ctx.answerCbQuery();
});

export default settingsCommands;
export { redis };

async function toggle(key: string) {
  const exists = await redis.exists(key);
  if (exists) return await redis.del(key);
  // set to 1 as it takes less memory than empty string
  return await redis.set(key, 1);
}

// if 0 - doesn't exist. Setting disabled.
// else - 1 does exist. Setting enabled - exclude from url replies

// Slightly counterintuitive but will help to save redis memory
export const isTimestampOn = async (id: number): Promise<boolean> =>
  (await redis.exists(redisKey(id, Settings.timestamp))) === 0;

export const isDurationOn = async (id: number): Promise<boolean> =>
  (await redis.exists(redisKey(id, Settings.duration))) === 0;

const emoji = (setting: boolean) => (setting ? "❌" : "✅");
