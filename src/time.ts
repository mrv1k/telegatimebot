// How Telegram extracts id and timestamp extractYoutubeVideoIdAndTimestamp
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramUniversalVideoContent/Sources/YoutubeEmbedImplementation.swift#L12
// Telegram formats video timestamp in military time (not 100% sure)
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramStringFormatting/Sources/DateFormat.swift#L29

const pad0 = (digit: number) => `${digit <= 9 ? "0" : ""}${digit}`;

type Time = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export function formatTime(time: Time): string {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = time;

  const hasSeconds = seconds !== 0;
  const hasMinutes = minutes !== 0;
  const hasHours = hours !== 0;
  const hasDays = days !== 0;

  const hasAll = [hasSeconds, hasMinutes, hasHours, hasDays];
  if (hasAll.every((v) => v === false)) {
    return "will throw";
    // throw Error("Duration: All numbers are 0");
  }

  const onlySeconds = hasSeconds && !hasMinutes && !hasHours && !hasDays;
  if (onlySeconds) return `0:${pad0(seconds)}`;

  const minutesWithSeconds = hasMinutes && !hasHours && !hasDays;
  if (minutesWithSeconds) return `${minutes}:${pad0(seconds)}`;

  const ss = pad0(seconds);
  const mm = pad0(minutes);
  let h = 0;
  if (hasHours) h += hours;
  if (hasDays) h += days * 24;

  return `${h}:${mm}:${ss}`;
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

export function secondsToTime(timestamp: number): Time {
  let time = timestamp;
  const days = Math.floor(time / DAY);
  time -= days * DAY;
  const hours = Math.floor(time / HOUR);
  time -= hours * HOUR;
  const minutes = Math.floor(time / MINUTE);
  time -= minutes * MINUTE;
  const seconds = time;
  time -= seconds;

  return { days, hours, minutes, seconds };
}
