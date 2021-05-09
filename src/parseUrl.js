const urlParser = require("js-video-url-parser/lib/base");
require("js-video-url-parser/lib/provider/youtube");

const valid = "https://www.youtube.com/watch?v=hXetO_bYcMo";
const invalid = "https://www.something.else/watch?v=wawawewa";

const a = urlParser.parse(valid);
const b = urlParser.parse(invalid);

// Parsing an incorrect url or trying to create one with an invalid object will return undefined

console.log(a);
console.log(b);
