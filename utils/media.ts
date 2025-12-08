import { MEDIA_BASE_URL } from '@/services/api';

export const getMediaUri = (uri: string | undefined | null) => {
  if (!uri) return '';
  return uri.startsWith('http') ? uri : `${MEDIA_BASE_URL}/${uri}`;
};
