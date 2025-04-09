import { Duration, parse as parseISO8601Duration } from "iso8601-duration";
import { YouTubeAPIError } from "./errors";
import { youtube } from "@googleapis/youtube";

export type DurationMaybeStream = { duration: Duration; isStream?: boolean };

const part = ["contentDetails", "liveStreamingDetails"];
const LIVESTREAM_DURATION = "P0D";

function configureYouTube(env: Env) {
  return youtube({
    version: "v3",
    auth: env.YOUTUBE_API_KEY,
  });
}

export async function fetchDuration(
  env: Env,
  id: string,
): Promise<DurationMaybeStream> {
  const client = configureYouTube(env);

  const {
    data: { items },
  } = await client.videos.list({ part, id: [id] });

  if (items === undefined || items.length === 0) {
    throw new YouTubeAPIError("Video is private or doesn't exist");
  }

  const item = items[0];
  const isoDuration = item?.contentDetails?.duration;

  // there's no real duration, but I guess we can use start time?
  if (
    item.liveStreamingDetails?.actualStartTime &&
    isoDuration == LIVESTREAM_DURATION
  ) {
    const derivedDuration = convertDateToDuration(
      item.liveStreamingDetails?.actualStartTime,
    );
    const duration = parseISO8601Duration(derivedDuration);
    return { duration, isStream: true };
  }

  if (isoDuration) {
    const duration = parseISO8601Duration(isoDuration);
    return { duration };
  }

  throw new YouTubeAPIError("Couldn't get duration from YouTube");
}

function convertDateToDuration(isoDate: string) {
  const date = new Date(isoDate);
  const durationMillis = Date.now() - date.getTime();

  // ChatGPT'ed. Hopefully it works. I'll take 50/50
  // Convert milliseconds to years, months, days, hours, minutes, and seconds
  const durationSeconds = Math.floor(durationMillis / 1000);
  const durationMinutes = Math.floor(durationSeconds / 60);
  const durationHours = Math.floor(durationMinutes / 60);
  const durationDays = Math.floor(durationHours / 24);

  const years = Math.floor(durationDays / 365);
  const months = Math.floor((durationDays % 365) / 30);
  const days = durationDays % 30;
  const hours = durationHours % 24;
  const minutes = durationMinutes % 60;
  const seconds = durationSeconds % 60;

  return `P${years}Y${months}M${days}DT${hours}H${minutes}M${seconds}S`;
}
