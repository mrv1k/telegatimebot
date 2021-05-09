require("dotenv").config();

const { parse } = require("iso8601-duration");

const { google } = require("googleapis");
const part = ["contentDetails"];

async function getLength() {
  const youtube = await google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });
  // https://www.youtube.com/watch?v=AjWfY7SnMBI
  // https://youtu.be/AjWfY7SnMBI?t=86408
  try {
    const res = await youtube.videos.list({
      part,
      id: ["AjWfY7SnMBI"],
    });
    const duration = res.data.items[0].contentDetails.duration;
    console.log(duration);
    const parsed = parse(duration);
    console.log(parsed);

    const doubleDigit = (digit) => `${digit <= 9 ? "0" : ""}${digit}`;
    let reply = "";
    let hours = 0;
    if (parsed.days !== 0) hours += parsed.days * 24;
    if (parsed.hours !== 0) hours += parsed.hours;
    reply += hours;
    reply += ":";
    if (parsed.minutes !== 0) reply += doubleDigit(parsed.minutes);
    reply += ":";
    if (parsed.seconds !== 0) reply += doubleDigit(parsed.seconds);
    console.log(reply);
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
