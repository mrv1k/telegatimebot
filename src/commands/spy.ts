import { Composer, deunionize } from "telegraf";
import type { ContextWithEnv } from "../envs";
import { hasNoUserTimestamp, YOUTUBE_URL } from "../helpers";
import { parseUrl } from "../url-parser";
import { getDurationText } from "./duration";
import { getTimestampText, getUrlTimestamp } from "./timestamp";

const spy = new Composer<ContextWithEnv>();

// Spy for texts containing YouTube URLs
spy.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) {
    return;
  }
  const message = deunionize(ctx.message);
  const { message_id } = message;

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);

  const duration = await getDurationText(ctx.env, parsedUrl);
  const texts: string[] = [duration];

  if (hasNoUserTimestamp(message.text)) {
    const timestamp = getUrlTimestamp(parsedUrl);
    if (timestamp) {
      texts.push(getTimestampText(timestamp));
    }
  }

  const text = texts.join("\n");
  return ctx.reply(text, { reply_parameters: { message_id } });
});

export default spy;
