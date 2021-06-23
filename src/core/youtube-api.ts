import { youtube } from "@googleapis/youtube";
import { Duration, parse as parseISO8601 } from "iso8601-duration";
import { YouTubeAPIError } from "./error-handler";

const part = ["contentDetails", "liveStreamingDetails"];

const { YOUTUBE_API_KEY } = process.env;
if (YOUTUBE_API_KEY === undefined) {
  throw new TypeError("YOUTUBE_API_KEY must be provided!");
}

const client = youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export async function fetchDuration(id: string): Promise<Duration> {
  try {
    const res = await client.videos.list({
      part,
      id: [id],
    });

    const {
      data: { items },
    } = res;

    if (items === undefined || items.length === 0) {
      throw new YouTubeAPIError("Video is private or doesn't exist");
    }

    const item = items[0];

    if (item.liveStreamingDetails) {
      throw new YouTubeAPIError("Livestream Duration: ¯\\_(ツ)_/¯");
    }

    const rawDuration = item?.contentDetails?.duration;
    if (rawDuration) return parseISO8601(rawDuration);

    throw new YouTubeAPIError("Couldn't get duration from YouTube");
  } catch (error) {
    // rethrow as is
    if (error instanceof YouTubeAPIError) throw error;
    throw new YouTubeAPIError("YouTube API failed", error.stack);
  }
}
