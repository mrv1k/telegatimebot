require("dotenv").config();

const { google } = require("googleapis");
const part = ["contentDetails"];

async function getLength() {
  const youtube = await google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

  try {
    const res = await youtube.videos.list({
      part,
      id: ["D-cp5TEid5o"],
    });
    const duration = res.data.items[0].contentDetails.duration;
    console.log(duration);
    console.log(Date.parse(duration));
  } catch (e) {
    console.error(e);
  }
}

getLength();

function getChannel(auth) {
  var service = google.youtube("v3");
  service.channels.list(
    {
      auth: auth,
      part: "snippet,contentDetails,statistics",
      forUsername: "GoogleDevelopers",
    },
    function (err, response) {
      if (err) {
        console.log("The API returned an error: " + err);
        return;
      }
      var channels = response.data.items;
      if (channels.length == 0) {
        console.log("No channel found.");
      } else {
        console.log(
          "This channel's ID is %s. Its title is '%s', and " +
            "it has %s views.",
          channels[0].id,
          channels[0].snippet.title,
          channels[0].statistics.viewCount
        );
      }
    }
  );
}
