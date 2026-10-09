export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} ثانية`;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    if (minutes > 0) {
      return `${hours} ساعة و ${minutes} دقيقة`;
    }

    return `${hours} ساعة`;
  }

  if (remainingSeconds > 0) {
    return `${minutes} دقيقة و ${remainingSeconds} ثانية`;
  }

  return `${minutes} دقيقة`;
}