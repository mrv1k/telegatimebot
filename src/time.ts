import { Duration } from "iso8601-duration";

const pad0 = (digit: number) => `${digit <= 9 ? "0" : ""}${digit}`;

export default function formatDuration(parsedDuration: Duration): string {
  const { days = 0, hours = 0, minutes = 0, seconds = 0 } = parsedDuration;

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
