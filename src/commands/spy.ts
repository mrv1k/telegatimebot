import { Composer, deunionize } from "telegraf";

import { getTimestampText, getUrlTimestamp } from "./timestamp";
import { getDurationText } from "./duration";
import { parseUrl } from "../url-parser";
import { hasNoUserTimestamp, YOUTUBE_URL } from "../helpers";

const spy = new Composer();

// Spy for texts containing YouTube URLs
spy.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) {
    return;
  }
  const message = deunionize(ctx.message);
  const { message_id } = message;

  const input = ctx.match.input;
  const parsedUrl = parseUrl(input);

  const duration = await getDurationText(parsedUrl);
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
