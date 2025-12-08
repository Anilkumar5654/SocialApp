// Views ko 1.2M, 5K me badalne ke liye
export const formatViews = (views: number | undefined | null) => {
  const safeViews = Number(views) || 0;
  if (safeViews >= 1000000) return `${(safeViews / 1000000).toFixed(1)}M`;
  if (safeViews >= 1000) return `${(safeViews / 1000).toFixed(1)}K`;
  return safeViews.toString();
};

// Seconds ko 05:30 me badalne ke liye
export const formatDuration = (seconds: number | undefined | null) => {
    const sec = Number(seconds) || 0;
    if (sec <= 0) return "00:00";
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};
