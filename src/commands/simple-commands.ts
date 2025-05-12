import { TTBComposer } from "..";
import { delay } from "../helpers";

// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
const HELP_TEXT = `
Commands:
/[d]uration <link> - get duration
/[t]imestamp <link?t=1> - convert timestamp
/dt - /duration & /timestamp combined
/help - display help message`;

const START_TEXT = `Beep-boop. I'm a [ro]bot.
I wait for a YouTube link. I fetch duration. I convert timestamp.`;

export function useSimpleCommands(simpleCommands: TTBComposer) {
  // Every chat with bot starts from /start
  simpleCommands.command("start", async (ctx) => {
    await ctx.reply(START_TEXT + "\n" + HELP_TEXT);
  });

  simpleCommands.command("help", async (ctx) => {
    await ctx.reply(HELP_TEXT);
  });

  simpleCommands.command(["hi", "hello"], async (ctx) => {
    if (!ctx.message) {
      return null;
    }

    if (ctx.message.from.id === Number(ctx.env.SECRET_ID)) {
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
        return ctx.reply("hej Leshugggah");
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

    if (ctx.message.from.id === Number(ctx.env.SECRET_ID)) {
      ctx.reply("bye mom 😘");
      // FIXME: time works differently in workers
      // await delay(2000);
      return await ctx.leaveChat();
    }

    switch (ctx.message.from.username) {
      case "mrv1k": {
        await ctx.reply("please dad!");
        await delay(2000);
        await ctx.reply("i don't want to go :(");
        await delay(2000);
        await ctx.reply("bye dad 🫡");
        await delay(2000);
        return await ctx.leaveChat();
      }
      case "JemboDev": {
        await ctx.reply("Adieu");
        await delay();
        await ctx.reply("goodbye");
        await delay();
        await ctx.reply("auf Wiederseh'n");
        return ctx.leaveChat();
      }
      case "LexBorisoff": {
        await ctx.reply("What are you doing Yakutza?");
        await delay();
        await ctx.reply("☠️");
        return ctx.leaveChat();
      }
      case "gelotheprodigy": {
        await ctx.reply("no 🤨");
        await delay(6969);
        return ctx.leaveChat();
      }
      default: {
        if (ctx.message.chat.type === "group") {
          return await ctx.reply("cya all");
        }
        await ctx.reply("bye");
      }
    }
  });
}
