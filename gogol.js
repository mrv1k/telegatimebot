const youtube = require("@googleapis/youtube");
const { parse: parseDuration } = require("iso8601-duration");

const part = ["contentDetails"];

const client = youtube.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

module.exports = async function fetchVideoDuration(id) {
  try {
    const res = await client.videos.list({
      part,
      id: [id],
    });
    const duration = res.data.items[0].contentDetails.duration;
    return parseDuration(duration);
  } catch (e) {
    console.error(e);
  }
};
