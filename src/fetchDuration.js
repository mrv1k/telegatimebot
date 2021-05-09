const youtube = require("@googleapis/youtube");
const { parse: parseDuration } = require("iso8601-duration");

const part = ["contentDetails"];

const client = youtube.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

module.exports = async function fetchDuration(id) {
  try {
    const res = await client.videos.list({
      part,
      id: [id],
    });
    const { data } = res;

    if (res.status === 200 && data.length === 0) {
      return "private";
    }

    const firstItem = data.items[0];
    const duration = firstItem?.contentDetails?.duration;
    if (duration) return parseDuration(duration);
    return "duration_not_found";
  } catch (e) {
    console.error(e);
  }
};
