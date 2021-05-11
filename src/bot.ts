import "dotenv/config";

import { Telegraf } from "telegraf";
import { Context } from "telegraf/typings";
import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";

import fetchDuration from "./fetchDuration";
import formatDuration from "./formatDuration";

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply("Hey meatbags"));
bot.help((ctx) =>
  ctx.reply(`
/duration <url>
/timestamp <url>?t=666
`)
);

bot.command("timestamp", async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    return ctx.reply("Converts to telegram timestamp.");
  }

  const url = params[1];
  const parsedUrl = urlParser.parse(url);

  if (!parsedUrl) {
    return ctx.reply("Could not parse YouTube's url");
  }

  const urlParams = parsedUrl?.params;
  if (!urlParams || !Number.isFinite(urlParams.start)) {
    return ctx.reply("Could not parse timestamp");
  }

  const timestamp: number = urlParams.start;
  const formattedTime = formatDuration(secondsToHms(timestamp));
  ctx.reply(formattedTime, { reply_to_message_id: ctx.message.message_id });
});

// regex tests - https://regexr.com/5si73
bot.url(/youtu(\.)?be/, (ctx) => {
  const url = ctx.match.input;
  sendDurationReply(ctx, url);
});

bot.command(["length", "duration"], async (ctx) => {
  const params = ctx.message.text.split(" ");
  if (params.length === 1) {
    const rick_url = "https://youtu.be/oHg5SJYRHA0";
    await ctx.reply("Gets YouTube video duration.");
    const botMessage = await ctx.reply(`${params[0]} ${rick_url}`, {
      disable_web_page_preview: true,
    });

    await sendDurationReply(ctx, rick_url, botMessage.message_id);
    return;
  }

  const url = params[1];
  await sendDurationReply(ctx, url);
});

bot.command("stfu", (ctx) => {
  // TODO: silence mode
});
bot.command("unstfu", (ctx) => {
  // TODO: disable silenec mode
});
bot.command("gtfo", (ctx) => {
  ctx.reply("Self-destruct initiated");
  setTimeout(() => {
    ctx.leaveChat();
  }, 1000);
});

bot.catch((err, ctx) => {
  console.log(err);
});

bot.launch();

console.log("I am ALIVE!");
// "¯\\_(ツ)_/¯ It's a live stream";

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

async function getDuration(url: string) {
  // Parsing an incorrect url or trying to create one with an invalid object will return undefined
  const parsedUrl = urlParser.parse(url);
  if (parsedUrl === undefined) return;

  const duration = await fetchDuration(parsedUrl.id);
  return formatDuration(duration);
}

/** Takes: a context type and an update type (or message subtype).
    Produces: a context that has some properties required, and some undefined.
    The required ones are those that are always present when the given update (or message) arrives.
    The undefined ones are those that are always absent when the given update (or message) arrives. */
// type MatchedContext<
//   C extends Context,
//   T extends tt.UpdateType | tt.MessageSubType
// > = NarrowedContext<C, tt.MountMap[T]>;

/**
 * Narrows down `C['update']` (and derived getters)
 * to specific update type `U`.
 *
 * Used by [[`Composer`]],
 * possibly useful for splitting a bot into multiple files.
 */
// export type NarrowedContext<
//   C extends Context,
//   U extends tg.Update
// > = Context<U> & Omit<C, keyof Context>;

// (parameter) ctx: MatchedContext<Context<Update>, "text">

// MatchedContext<Context<Update> & {
//   match: RegExpExecArray;
// }, "channel_post" | "message">
async function sendDurationReply<CTX extends Context>(
  ctx: CTX,
  url: string,
  reply_id?: number
) {
  if (ctx === undefined) return;
  // ctx.mess
  const reply_to_message_id = reply_id ?? ctx.message?.message_id;
  const duration = await getDuration(url);

  if (duration) {
    return ctx.reply(`Duration: ${duration}`, {
      reply_to_message_id,
    });
  }

  ctx.reply("Could not parse YouTube's url");
}

function secondsToHms(timestamp: number) {
  const hours = Math.floor(timestamp / 3600);
  const minutes = Math.floor((timestamp % 3600) / 60);
  const seconds = Math.floor((timestamp % 3600) % 60);
  return { hours, minutes, seconds };
}
