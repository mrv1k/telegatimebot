import { delay } from "../helpers";
import { BotWithContext } from "..";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_TEXT = `
*Commands*:
/[d]uration \\<link\\> \\- get duration
/[t]imestamp \\<link?t\\=1\\> \\- convert timestamp
/dt \\- /duration & /timestamp combined
/help \\- display help message`;

const START_TEXT =
  `Beep-boop. I'm a [ro]bot.\\
I see a YouTube link. I fetch duration. I also convert timestamp.\\
May or may not take your job. Still deciding
` + HELP_TEXT;

const MOMS_ID = process.env.SECRET_ID;

export function registerSimpleCommands(bot: BotWithContext): BotWithContext {
  const simpleCommands = bot;

  // Every chat with bot starts from /start
  simpleCommands.command("start", (ctx) => {
    ctx.reply("start", { parse_mode: "MarkdownV2" });
  });

  simpleCommands.command("help", (ctx) => {
    ctx.reply("test", { parse_mode: "MarkdownV2" });
  });

  simpleCommands.command(["hi", "hello"], async (ctx) => {
    if (!ctx.message) {
      return null;
    }

    if (MOMS_ID && ctx.message.from.id === Number(MOMS_ID)) {
      return ctx.reply(`hi mom ❤️`, {
        reply_parameters: { message_id: ctx.msg.message_id },
      });
    }

    switch (ctx.message.from.username) {
      case "mrv1k": {
        return ctx.reply(`hi dad 🥸`);
      }
      case "JemboDev": {
        return ctx.reply("sup uncle");
      }
      case "LexBorisoff": {
        return ctx.reply("hello Lehman");
      }
      case "gelotheprodigy": {
        return ctx.reply(`gelo 🤨`);
      }

      default: {
        if (ctx.message.chat.type === "group") {
          return ctx.reply("sup ya'll");
        }
        return ctx.reply("hi");
      }
    }
  });

  simpleCommands.command(["bye", "cya"], async (ctx) => {
    if (ctx.chat.type === "private") {
      ctx.reply(
        "Nothing can make me leave this amazing conversation with you ;)",
      );
      ctx.reply("Seriously, bot API doesn't support leaving private chats");
      return;
    }

    if (!ctx.message) {
      return null;
    }

    if (MOMS_ID && ctx.message.from.id === Number(MOMS_ID)) {
      ctx.reply("bye mom 😘");
      await delay(2000);
      return ctx.leaveChat();
    }

    switch (ctx.message.from.username) {
      case "mrv1k": {
        ctx.reply("please dad!");
        await delay(2000);
        ctx.reply("i don't want to go :(");
        await delay(2000);
        ctx.reply("bye dad 🫡");
        await delay(2000);
        return ctx.leaveChat();
      }
      case "JemboDev": {
        ctx.reply("Adieu");
        await delay();
        ctx.reply("goodbye");
        await delay();
        ctx.reply("auf Wiederseh'n");
        return ctx.leaveChat();
      }
      case "LexBorisoff": {
        ctx.reply("What are you doing Yakutza?");
        await delay();
        ctx.reply("☠️");
        return ctx.leaveChat();
      }
      case "gelotheprodigy": {
        await delay(6969);
        return ctx.reply("no 🤨");
      }
      default: {
        if (ctx.message.chat.type === "group") {
          return ctx.reply("cya all");
        }
        ctx.reply("bye");
      }
    }
  });
  return simpleCommands;
}
