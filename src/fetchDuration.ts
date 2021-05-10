import { youtube } from "@googleapis/youtube";
import { Duration, parse as parseDuration } from "iso8601-duration";

const part = ["contentDetails"];

const client = youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function fetchDuration(
  id: string
): Promise<Duration | string> {
  try {
    const res = await client.videos.list({
      part,
      id: [id],
    });

    const {
      data: { items },
    } = res;

    if (items === undefined || items.length === 0) {
      return "items_empty";
    }

    const firstItem = items[0];
    const duration = firstItem?.contentDetails?.duration;
    if (duration) return parseDuration(duration);
    return "duration_parse_failed";
  } catch (e) {
    console.error(e);
    return "youtube_client_error";
  }
}
