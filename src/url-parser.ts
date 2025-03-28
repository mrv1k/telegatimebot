import type { VideoInfo } from "js-video-url-parser/lib/urlParser";

import urlParser from "js-video-url-parser/lib/base";
import "js-video-url-parser/lib/provider/youtube";
import { NoopError, UrlParseError } from "./errors";

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
    // Can't fetch, do nothing
    throw new NoopError("Can't fetch duration of a playlist");
  }

  return parsedUrl;
}
