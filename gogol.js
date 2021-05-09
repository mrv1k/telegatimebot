require("dotenv").config();

const urlParser = require("js-video-url-parser/lib/base");
require("js-video-url-parser/lib/provider/youtube");

const { parse: parseDuration } = require("iso8601-duration");

const { google } = require("googleapis");
const part = ["contentDetails"];

const a = "https://www.youtube.com/watch?v=AjWfY7SnMBI";
const b = "https://youtu.be/AjWfY7SnMBI?t=86408";
console.log(urlParser.parse(a));
console.log(urlParser.parse(b));

async function getLength() {
  const youtube = await google.youtube({
    version: "v3",
    auth: process.env.YOUTUBE_API_KEY,
  });

  try {
    const res = await youtube.videos.list({
      part,
      id: ["AjWfY7SnMBI"],
    });
    const duration = res.data.items[0].contentDetails.duration;
    console.log(duration);
    const parsed = parseDuration(duration);
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

// getLength();

// > urlParser.parse('http://www.youtube.com/watch?v=yQaAGmHNn9s&list=PL46F0A159EC02DF82#t=1m40');
// {
//     mediaType: 'video',
//     id: 'yQaAGmHNn9s',
//     list: 'PL46F0A159EC02DF82',
//     provider: 'youtube'
//     params: {
//       start: 100
//     }
// }
