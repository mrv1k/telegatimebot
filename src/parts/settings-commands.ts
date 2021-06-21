import { Composer, Markup } from "telegraf";
import redis, { redisKey } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

export enum Settings {
  timestamp = "timestamp",
  duration = "duration",
}

const SETTINGS_MESSAGE = `<b>Settings</b>
By default, I auto-run /dt command for messages with YouTube links.
Change it by clicking bellow`;

settingsCommands.settings(async (ctx) => {
  if (!ctx.chat) return;

  const inlineKeyboard = await makeInlineKeyboard({ chatId: ctx.chat.id });

  ctx.replyWithHTML(SETTINGS_MESSAGE, {
    reply_markup: inlineKeyboard.reply_markup,
  });
});

settingsCommands.action("toggle_duration", async (ctx) => {
  if (!ctx.chat) return;
  const durationKey = redisKey(ctx.chat.id, Settings.duration);
  const isDurationEnabled = await toggle(durationKey);

  const inlineKeyboard = await makeInlineKeyboard({
    chatId: ctx.chat.id,
    isDurationEnabled,
  });

  await ctx.editMessageText(SETTINGS_MESSAGE, {
    parse_mode: "HTML",
    reply_markup: inlineKeyboard.reply_markup,
  });

  ctx.answerCbQuery();
});

settingsCommands.action("toggle_timestamp", async (ctx) => {
  if (!ctx.chat) return;
  const timestampKey = redisKey(ctx.chat.id, Settings.timestamp);
  const isTimestampEnabled = await toggle(timestampKey);

  const inlineKeyboard = await makeInlineKeyboard({
    chatId: ctx.chat.id,
    isTimestampEnabled,
  });

  await ctx.editMessageText(SETTINGS_MESSAGE, {
    parse_mode: "HTML",
    reply_markup: inlineKeyboard.reply_markup,
  });
});

export default settingsCommands;

type InlineKeyboardParams = {
  chatId: number;
  isDurationEnabled?: boolean;
  isTimestampEnabled?: boolean;
};

const makeInlineKeyboard = async (initial: InlineKeyboardParams) => {
  // if initial has enable status, use it. Fallback to fetching setting from redis
  const isDurationEnabled =
    initial.isDurationEnabled ?? (await getDurationStatus(initial.chatId));
  const isTimestampEnabled =
    initial.isTimestampEnabled ?? (await getTimestampStatus(initial.chatId));

  const durationText = `${onOffEmoji(isDurationEnabled)} duration`;
  const timestampText = `${onOffEmoji(isTimestampEnabled)} timestamp`;

  // array of arrays, because multiple row keyboards
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(durationText, "toggle_duration"),
      Markup.button.callback(timestampText, "toggle_timestamp"),
    ],
  ]);
};

async function toggle(key: string) {
  // 0 - enabled, 1 - disabled
  const exists = await redis.exists(key);
  let isEnabled;

  // if it existed, it was disabled, enable it
  if (exists) {
    await redis.del(key);
    isEnabled = true;
  } else {
    // set to 1 as it takes less memory than empty string
    await redis.set(key, 1);
    isEnabled = false;
  }

  return isEnabled;
}

// redis.exists
// 1 if the key exists.
// 0 if the key does not exist.
// Flip that with comparison. Slightly counterintuitive but helps to save redis memory
// if 0 the setting doesn't exist. Setting is off, display information
// else - 1 does exist. Setting is on, DON'T display information

export const getTimestampStatus = async (id: number): Promise<boolean> =>
  (await redis.exists(redisKey(id, Settings.timestamp))) === 0;

export const getDurationStatus = async (id: number): Promise<boolean> =>
  (await redis.exists(redisKey(id, Settings.duration))) === 0;

const onOffEmoji = (isOn: boolean) => (isOn ? "❌" : "✅");
