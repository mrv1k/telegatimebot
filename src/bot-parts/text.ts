// Escapes are for Telegram Markdown: https://core.telegram.org/bots/api#markdownv2-style
export const HELP_MESSAGE = `
You can control me by sending these *commands*:
/duration \\<link\\> \\- display video duration
/timestamp \\<link with timestamp\\> \\- create telegram timestamp
/settings \\- open settings
/help \\- display help message

*Shorthands:*
/d \\- for /duration
/t \\- for /timestamp

_To avoid polluting commands only /duration and /timestamp are added to the list of commands_
`;

export const START_MESSAGE =
  `I help you by replying to YouTube's link with:
1\\. Video duration
2\\. Telegram friendly timestamp

By default, I automatically listen to YouTube's links\\. \
Just send a message and I'll fetch the info\\. \
Can be disabled in /settings
` + HELP_MESSAGE;
