import { youtube } from "@googleapis/youtube";
import { Duration, parse as parseDuration } from "iso8601-duration";

const part = ["contentDetails"];

const client = youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export default async function fetchDuration(id: string): Promise<Duration> {
  try {
    const res = await client.videos.list({
      part,
      id: [id],
    });

    const {
      data: { items },
    } = res;

    if (items === undefined || items.length === 0) {
      throw Error("Data items are missing");
    }

    const firstItem = items[0];
    const duration = firstItem?.contentDetails?.duration;
    if (duration) return parseDuration(duration);

    throw Error("Duration parse failed");
  } catch (error) {
    // TODO: wrap an error
    console.error(error);
    throw error;
  }
}
