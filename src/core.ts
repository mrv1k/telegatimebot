import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";
import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

import fetchDuration from "./fetch-duration";
import { formatTime, secondsToTime } from "./time";

export function parseUrl(text: string): VideoInfo {
  const parsedUrl = urlParser.parse(text);
  if (parsedUrl) return parsedUrl;
  throw Error("Could not parse YouTube's URL");
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

export function getTimestampText(timestamp: number): string {
  const timestampText = formatTime(secondsToTime(timestamp));
  return `Timestamp: ${timestampText}`;
}

export function getUrlTimestampOrThrow(parsedUrl: VideoInfo): number {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) return parsed;
  throw Error("Could not get timestamp");
}

export function findFirstArg(text: string): string | undefined {
  const parts = text.split(/ +/);
  if (parts.length === 1) return;
  return parts[1];
}
