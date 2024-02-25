// How Telegram extracts id and timestamp extractYoutubeVideoIdAndTimestamp
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramUniversalVideoContent/Sources/YoutubeEmbedImplementation.swift#L12
// Telegram formats video timestamp in military time (not 100% sure)
// https://github.com/TelegramMessenger/Telegram-iOS/blob/release-7.6.2/submodules/TelegramStringFormatting/Sources/DateFormat.swift#L29

import { TimeError } from "./error-handler";

const pad0 = (digit: number) => `${digit <= 9 ? "0" : ""}${digit}`;

type Time = {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

export function formatTime(time: Time, isStream = false): string {
  const { seconds = 0, minutes = 0, hours = 0, days = 0 } = time;

  const hasSeconds = seconds > 0;
  const hasMinutes = minutes > 0;
  const hasHours = hours > 0;
  const hasDays = days > 0;

  const hasAll = [hasSeconds, hasMinutes, hasHours, hasDays];
  if (hasAll.every((v) => v === false)) {
    throw new TimeError(
      "Nothing to format. Seconds, minutes, hours and days are all 0"
    );
  }

  const ss = pad0(seconds);
  if (!hasHours && !hasDays) {
    return hasMinutes ? `${minutes}:${ss}` : `0:${ss}`;
  }

  const mm = pad0(minutes);
  if (hasHours && !hasDays) {
    return `${hours}:${mm}:${ss}`;
  }

  const duration = `${days} days ${hours} hours ${minutes} minutes and ${seconds} seconds`
  // Easter egg messages
  const msg = `Duration is ${duration}. The hell are you planning to watch?`;
  return isStream ? `First of all, why are you sending me livestream videos? \\
Are you trying to break me? 🤨 Ha jockes on you, I'm unbrekable.
\\ Also, livestream has been running for ${duration} 😤` : msg
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
