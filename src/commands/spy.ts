import { Composer, deunionize } from "telegraf";
import {
  getDurationText,
  getTimestampText,
  getUrlTimestamp,
  parseUrl,
} from "../core";
import {
  hasNoUserTimestamp,
  templateReply,
  YOUTUBE_URL,
} from "./command-helpers";

const spy = new Composer();

// Spy for texts containing YouTube URLs
spy.url(YOUTUBE_URL, async (ctx) => {
  if (!ctx.message) return;
  const message = deunionize(ctx.message);

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
  return templateReply(ctx, text, ctx.message.message_id);
});

export default spy
