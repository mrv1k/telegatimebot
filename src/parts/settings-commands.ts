import { Composer, Markup } from "telegraf";
import { getSettingState, toggleSetting } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

enum Settings {
  timestamp = "timestamp",
  duration = "duration",
}

const SETTINGS_MESSAGE = `<b>Settings:</b>
By default, I auto-run
/duration and /timestamp commands for messages with YouTube links.
Change it bellow`;

settingsCommands.settings(async (ctx) => {
  if (!ctx.chat) return;

  const inlineKeyboard = await makeInlineKeyboard({ chatId: ctx.chat.id });

  ctx.replyWithHTML(SETTINGS_MESSAGE, {
    reply_markup: inlineKeyboard.reply_markup,
  });
});

settingsCommands.action("toggle_duration", async (ctx) => {
  if (!ctx.chat) return;

  const isDurationEnabled = await toggleSetting(ctx.chat.id, Settings.duration);

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

  const isTimestampEnabled = await toggleSetting(
    ctx.chat.id,
    Settings.timestamp
  );

  const inlineKeyboard = await makeInlineKeyboard({
    chatId: ctx.chat.id,
    isTimestampEnabled,
  });

  await ctx.editMessageText(SETTINGS_MESSAGE, {
    parse_mode: "HTML",
    reply_markup: inlineKeyboard.reply_markup,
  });
});

type InlineKeyboardParams = {
  chatId: number;
  isDurationEnabled?: boolean;
  isTimestampEnabled?: boolean;
};

const makeInlineKeyboard = async (initial: InlineKeyboardParams) => {
  // if initial has enable status, use it. Fallback to fetching setting from redis
  const isDurationEnabled =
    initial.isDurationEnabled ??
    (await getSettingState(initial.chatId, Settings.duration));

  const isTimestampEnabled =
    initial.isTimestampEnabled ??
    (await getSettingState(initial.chatId, Settings.timestamp));

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

const onOffEmoji = (isOn: boolean) => (isOn ? "❌" : "✅");

export default settingsCommands;
export { Settings };
