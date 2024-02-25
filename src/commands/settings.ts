import { Composer } from "telegraf";
import { getSettingState, toggleSetting } from "../core/redis";

// use chat.id as unique key - https://core.telegram.org/bots/api#chat
const settingsCommands = new Composer();


const SETTINGS_TEXT = `<b>Settings:</b>
What should I get when I see YouTube link?`;

settingsCommands.settings(async (ctx) => {
  if (!ctx.chat) return;

  const inlineKeyboard = await makeInlineKeyboard({ chatId: ctx.chat.id });

  ctx.replyWithHTML(SETTINGS_TEXT, {
    reply_markup: inlineKeyboard.reply_markup,
  });
});


export default settingsCommands;
