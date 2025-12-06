import { MEDIA_BASE_URL } from '@/services/api'; 
// Note: Assuming formatTimeAgo and other formatting constants are available or defined here.

// Helper: Get Full URL
export const getMediaUrl = (uri: string | undefined) => {
  if (!uri) return '';
  return uri.startsWith('http') ? uri : `${MEDIA_BASE_URL}/${uri}`;
};

// Helper: Format Views (e.g. 1.2M, 5K)
export const formatViews = (views: number | undefined | null) => {
  const safeViews = Number(views) || 0;
  if (safeViews >= 1000000) return `${(safeViews / 1000000).toFixed(1)}M`;
  if (safeViews >= 1000) return `${(safeViews / 1000).toFixed(1)}K`;
  return safeViews.toString();
};

// Helper: Format Time Ago (Placeholder based on common logic)
// **IMPORTANT:** If you already have this logic in constants/timeFormat.ts, 
// you should import it from there and export it here. 
// For now, defining it here to solve the import error.
export const formatTimeAgo = (dateString: string | number | Date) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
};
