import { youtube } from "@googleapis/youtube";
import { Duration, parse as parseISO8601Duration } from "iso8601-duration";
import { YouTubeAPIError } from "./error-handler";

const part = ["contentDetails", "liveStreamingDetails"];
const LIVESTREAM_DURATION = "P0D"

const { YOUTUBE_API_KEY } = process.env;
if (YOUTUBE_API_KEY === undefined) {
  throw new TypeError("YOUTUBE_API_KEY must be provided!");
}

const client = youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function metchDuration(id: string): Promise<Duration> {
  const { data: { items } } = await client.videos.list({ part, id: [id], });

  if (items === undefined || items.length === 0) {
    throw new YouTubeAPIError("Video is private or doesn't exist");
  }

  const item = items[0];
  const isoDuration = item?.contentDetails?.duration;
  // console.log(item, isoDuration)
  
  // there's no real duration, but I guess we can use start time?
  if (item.liveStreamingDetails?.actualStartTime
    && isoDuration == LIVESTREAM_DURATION) {
    console.log(item.liveStreamingDetails.actualStartTime)
    const duration = convertDateToDuration(item.liveStreamingDetails?.actualStartTime)
    const parsed = parseISO8601Duration(duration)
    console.log(duration, parsed)
    return parsed
  }

  if (isoDuration) {
    return parseISO8601Duration(isoDuration);
  }

  throw new YouTubeAPIError("Couldn't get duration from YouTube");
}

function convertDateToDuration(isoDate: string) {
  const date = new Date(isoDate)
  const durationMillis = Date.now() - date.getTime()

  // ChatGPT'ed
  // Convert milliseconds to years, months, days, hours, minutes, and seconds
  const durationSeconds: number = Math.floor(durationMillis / 1000);
  const durationMinutes: number = Math.floor(durationSeconds / 60);
  const durationHours: number = Math.floor(durationMinutes / 60);
  const durationDays: number = Math.floor(durationHours / 24);

  const years: number = Math.floor(durationDays / 365);
  const months: number = Math.floor((durationDays % 365) / 30);
  const days: number = durationDays % 30;
  const hours: number = durationHours % 24;
  const minutes: number = durationMinutes % 60;
  const seconds: number = durationSeconds % 60;

  const durationISO8601 = `P${years}Y${months}M${days}DT${hours}H${minutes}M${seconds}S`;
  return durationISO8601 
}

