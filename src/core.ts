import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";
import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

import fetchDuration from "./fetchDuration";
import { formatTime, secondsToTime } from "./time";

export function parseUrl(text: string) {
  const parsedUrl = urlParser.parse(text);
  if (parsedUrl) return parsedUrl;
  throw Error("Could not parse YouTube's URL");
}

export function getUrlTimestamp(parsedUrl: VideoInfo) {
  const params = parsedUrl?.params;

  // url parser uses 0 if ?t param is found but failed to parse, ie: ?t=123a or ?t=-1
  if (params && typeof params.start === "number" && params.start > 0) {
    // start is timestamp
    return params.start;
  }
}

export function getUrlTimestampOrThrow(parsedUrl: VideoInfo) {
  const parsed = getUrlTimestamp(parsedUrl);
  if (parsed) return parsed;
  throw Error("Could not get timestamp");
}

export function getTimestampText(timestamp: number) {
  const timestampText = formatTime(secondsToTime(timestamp));
  return `Timestamp: ${timestampText}`;
}

export async function getDurationText(parsedUrl: VideoInfo) {
  const duration = await fetchDuration(parsedUrl.id);
  // use underscore to display as italic with markdown renderer to break rendering as clickable timestamp
  return `Duration: _${formatTime(duration)}_`;
}

export function findFirstArg(text: string) {
  const parts = text.split(/ +/);
  if (parts.length === 1) return false;
  return parts[1];
}
