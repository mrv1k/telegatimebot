export const findFirstArg = (text: string): string | undefined => {
  const parts = text.split(/ +/);
  if (parts.length === 1) {
    return;
  }
  return parts[1];
};

// Match youtube or youtu.be; tests - https://regexr.com/5sve6
export const YOUTUBE_URL = /youtu(\.)?be/;

// Match anything between 0:00 to 99:99:99; Tests - https://regexr.com/5t1ib
const TELEGRAM_TIMESTAMP = /(\d{1,2}:\d{1,2}(?::\d{1,2})?)/;

export const hasNoUserTimestamp = (text = ""): boolean =>
  TELEGRAM_TIMESTAMP.test(text) === false;

export const pad0 = (d: number): string => `${d <= 9 ? "0" : ""}${d}`;

export const delay = (t = 1000) =>
  new Promise((resolve) => setTimeout(resolve, t));
