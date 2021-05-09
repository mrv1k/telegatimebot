const doubleDigit = (digit) => `${digit <= 9 ? "0" : ""}${digit}`;

module.exports = function formatDuration(parsedDuration) {
  const { days, hours, minutes, seconds } = parsedDuration;

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

  // f = formatted
  const fSeconds = doubleDigit(seconds);
  const fMinutes = doubleDigit(minutes);
  let fHours = 0;
  if (hours !== 0) fHours += hours;
  if (days !== 0) fHours += days * 24;

  return `${fHours}:${fMinutes}:${fSeconds}`;
};
