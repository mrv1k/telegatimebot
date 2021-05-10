import { Duration } from "iso8601-duration";

const doubleDigit = (digit: number) => `${digit <= 9 ? "0" : ""}${digit}`;

export default function formatDuration(parsedDuration: Duration): string {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = parsedDuration;

  const none = seconds === 0 && minutes === 0 && hours === 0 && days === 0;
  if (none) {
    return "¯\\_(ツ)_/¯ It's a live stream";
  }

  const onlySeconds =
    seconds !== 0 && minutes === 0 && hours === 0 && days === 0;
  if (onlySeconds) {
    return `0:${doubleDigit(seconds)}`;
  }

  const hasMinutes = minutes !== 0 && hours === 0 && days === 0;
  if (hasMinutes) {
    return `${minutes}:${doubleDigit(seconds)}`;
  }

  const ss = doubleDigit(seconds);
  const mm = doubleDigit(minutes);
  let h = 0;
  if (hours !== 0) h += hours;
  if (days !== 0) h += days * 24;

  return `${h}:${mm}:${ss}`;
}
