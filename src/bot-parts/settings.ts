import { Markup, Telegraf } from "telegraf";

// TODO: refactor to work for multiple chats
const tempSettings = {
  duration: true,
  timestamp: true,
};

const settingsBot = new Telegraf(process.env.BOT_TOKEN);

const word = (setting: boolean) => (setting ? "Disable" : "Enable");

settingsBot.settings((ctx) => {
  ctx.replyWithHTML("Settings", {
    ...Markup.inlineKeyboard([
      [Markup.button.callback("Disable all", "disable_all")],
      [
        Markup.button.callback(
          `${word(tempSettings.duration)} duration`,
          "toggle_duration"
        ),
        Markup.button.callback(
          `${word(tempSettings.timestamp)} timestamp`,
          "toggle_timestamp"
        ),
      ],
    ]),
  });
});

settingsBot.action("disable_all", (ctx) => {
  console.log("disable_all");
  tempSettings.duration = false;
  tempSettings.timestamp = false;
  ctx.answerCbQuery();
});

settingsBot.action("toggle_duration", (ctx) => {
  tempSettings.duration = !tempSettings.duration;
  console.log("toggle_duration", ctx);
  ctx.answerCbQuery();
});

settingsBot.action("toggle_timestamp", (ctx) => {
  tempSettings.timestamp = !tempSettings.timestamp;
  console.log("toggle_timestamp", ctx);
  ctx.answerCbQuery();
});

export default settingsBot;
