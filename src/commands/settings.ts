import { Composer, Markup } from "telegraf";
import { getSettingState, toggleSetting } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();

enum Settings {
  timestamp = "timestamp",
  duration = "duration",
}

enum Action {
  toggleDuration = "toggleDuration",
  toggleTimestamp = "toggleTimestamp",
}

`I solve YouTube in Telegram annoyances \
by getting video duration and converting timestamp\\.

By default, I passively look for YouTube links\\. \
When I see one I fetch info\\. Can be disabled in /settings`;

const SETTINGS_TEXT = `<b>Settings:</b>
What should I run when I see YouTube link?`;

settingsCommands.settings(async (ctx) => {
  if (!ctx.chat) return;

  const inlineKeyboard = await makeInlineKeyboard({ chatId: ctx.chat.id });

  ctx.replyWithHTML(SETTINGS_TEXT, {
    reply_markup: inlineKeyboard.reply_markup,
  });
});

settingsCommands.action(Action.toggleDuration, async (ctx) => {
  if (!ctx.chat) return;

  const isDurationEnabled = await toggleSetting(ctx.chat.id, Settings.duration);

  const inlineKeyboard = await makeInlineKeyboard({
    chatId: ctx.chat.id,
    isDurationEnabled,
  });

  await ctx.editMessageText(SETTINGS_TEXT, {
    parse_mode: "HTML",
    reply_markup: inlineKeyboard.reply_markup,
  });

  ctx.answerCbQuery();
});

settingsCommands.action(Action.toggleTimestamp, async (ctx) => {
  if (!ctx.chat) return;

  const isTimestampEnabled = await toggleSetting(
    ctx.chat.id,
    Settings.timestamp
  );

  const inlineKeyboard = await makeInlineKeyboard({
    chatId: ctx.chat.id,
    isTimestampEnabled,
  });

  await ctx.editMessageText(SETTINGS_TEXT, {
    parse_mode: "HTML",
    reply_markup: inlineKeyboard.reply_markup,
  });

  ctx.answerCbQuery();
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
  const durationText = `${onOffEmoji(isDurationEnabled)} duration`;

  const isTimestampEnabled =
    initial.isTimestampEnabled ??
    (await getSettingState(initial.chatId, Settings.timestamp));
  const timestampText = `${onOffEmoji(isTimestampEnabled)} timestamp`;

  // array of arrays, because multiple row keyboards
  return Markup.inlineKeyboard([
    [
      Markup.button.callback(durationText, Action.toggleDuration),
      Markup.button.callback(timestampText, Action.toggleTimestamp),
    ],
  ]);
};

const onOffEmoji = (isOn: boolean) => (isOn ? "❌" : "✅");

export default settingsCommands;
export { Settings };
