// How Telegram extracts id and timestamp extractYoutubeVideoIdAndTimestamp
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramUniversalVideoContent/Sources/YoutubeEmbedImplementation.swift#L12
// Telegram formats video timestamp in military time (not 100% sure)
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramStringFormatting/Sources/DateFormat.swift#L29

import type { DurationMaybeStream } from "./youtube-api";
import type { Duration } from "iso8601-duration";

import { TimeError } from "./error-handler";
import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";
import type { VideoInfo } from "js-video-url-parser/lib/urlParser";
import { UrlParseError } from "./error-handler";
import { fetchDuration } from "./youtube-api";

const SHORTS_URL = "shorts/";
const REGULAR_URL = "watch?v=";

export function parseUrl(text: string): VideoInfo {
  // youtube shorts are regular videos but parser currently does not support them
  if (text.includes(SHORTS_URL)) {
    text = text.replace(SHORTS_URL, REGULAR_URL);
  }

  const parsedUrl = urlParser.parse(text);
  if (!parsedUrl) {
    throw new UrlParseError("Could not parse YouTube link");
  }

  if (parsedUrl.mediaType === "playlist") {
    throw new UrlParseError(
      "Can't fetch duration of a playlist. Please specify a video"
    );
  }

  return parsedUrl;
}

export async function getDurationText(parsedUrl: VideoInfo): Promise<string> {
  const duration = await fetchDuration(parsedUrl.id);
  // Use \u200c (ZERO WIDTH NON-JOINER) to prevent Telegram from making it a timestamp
  return `Duration: \u200c${formatTime(duration)}`;
}

export function getUrlTimestamp(parsedUrl: VideoInfo): number | undefined {
  const params = parsedUrl?.params;

  // url parser uses 0 if ?t param is found but failed to parse, ie: ?t=123a or ?t=-1
  if (params && typeof params.start === "number" && params.start > 0) {
    // start is timestamp
    return params.start;
  }
}

export function getUrlTimestampOrThrow(parsedUrl: VideoInfo): number {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) return parsed;
  throw new UrlParseError("Could not get timestamp");
}

// converts timestamp ?t=123 to 2:03
export function getTimestampText(timestamp: number): string {
  const duration = secondsToDuration(timestamp)
  const timestampText = formatTime({duration});
  return `Timestamp: ${timestampText}`;
}

const pad0 = (d: number) => `${d <= 9 ? "0" : ""}${d}`;

export function formatTime({duration, isStream = false}: DurationMaybeStream): string {
  const { seconds = 0, minutes = 0, hours = 0, days = 0 } = duration;

  const hasSeconds = seconds > 0;
  const hasMinutes = minutes > 0;
  const hasHours = hours > 0;
  const hasDays = days > 0;

  const hasAll = [hasSeconds, hasMinutes, hasHours, hasDays];
  if (hasAll.every((v) => v === false)) {
    throw new TimeError(
      "Duration is 0 ¯\\_(ツ)_/¯"
    );
  }

  const ss = pad0(seconds);
  if (!hasHours && !hasDays) {
    return hasMinutes ? `${minutes}:${ss}` : `0:${ss}`;
  }

  const mm = pad0(minutes);
  if (hasHours && !hasDays) {
    return `${hours}:${mm}:${ss}`;
  }

  // Easter egg messages
  const durationMessage = `${days} days ${hours} hours ${minutes} minutes and ${seconds} seconds`;

  if (!isStream) {
    return `Duration is ${durationMessage}. The hell are you planning to watch?`;
  }

  return `First of all, why are you sending me livestream videos? \
Are you trying to break me? 🤨 Ha jockes on you, I'm unbrkrblrl. Ahem... \
Livestream has been running for ${durationMessage}`
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export function secondsToDuration(timestamp: number): Duration {
  let time = timestamp;
  const days = Math.floor(time / DAY);
  time -= days * DAY;
  const hours = Math.floor(time / HOUR);
  time -= hours * HOUR;
  const minutes = Math.floor(time / MINUTE);
  time -= minutes * MINUTE;
  const seconds = time;
  time -= seconds;

  return { days, hours, minutes, seconds };
}
