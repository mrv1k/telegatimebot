import { Composer, Markup } from "telegraf";

// TODO: refactor to work for multiple chats
const tempSettings = {
  duration: true,
  timestamp: true,
};

const settingsCommands = new Composer();

const word = (setting: boolean) => (setting ? "Disable" : "Enable");

settingsCommands.settings((ctx) => {
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

settingsCommands.action("disable_all", (ctx) => {
  console.log("disable_all");
  tempSettings.duration = false;
  tempSettings.timestamp = false;
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_duration", (ctx) => {
  tempSettings.duration = !tempSettings.duration;
  console.log("toggle_duration", ctx);
  ctx.answerCbQuery();
});

settingsCommands.action("toggle_timestamp", (ctx) => {
  tempSettings.timestamp = !tempSettings.timestamp;
  console.log("toggle_timestamp", ctx);
  ctx.answerCbQuery();
});

export default settingsCommands;
