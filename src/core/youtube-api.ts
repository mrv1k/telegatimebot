import { youtube } from "@googleapis/youtube";
import { Duration, parse as parseISO8601 } from "iso8601-duration";

const part = ["contentDetails", "liveStreamingDetails"];

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

export class YouTubeAPIError extends Error {
  constructor(message: string, stack?: string) {
    super(message);
    this.name = "YouTubeAPIError";
    if (stack) this.stack = stack;
  }
}
