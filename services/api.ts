import { ApiLogger } from '@/app/api-debug';
import { getDeviceId } from '@/utils/deviceId';

const API_BASE_URL = 'https://moviedbr.com/api';
const MEDIA_BASE_URL = 'https://moviedbr.com/upload';

export interface ApiError {
  message: string;
}

const apiDebugLogger = ApiLogger.log;

class ApiClient {
  private baseUrl: string;
  private mediaUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string, mediaUrl: string) {
    this.baseUrl = baseUrl;
    this.mediaUrl = mediaUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getMediaUrl(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${this.mediaUrl}/${path}`;
  }

  private async request<T>(
    endpoint: string, // Clean URL (no .php)
    options: RequestInit = {}
  ): Promise<T> {
    const startTime = Date.now();
    const headers: Record<string, string> = {};
    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;

    if (!isFormDataBody) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      // Sending token in Authorization header
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Capture and parse the request body for logging
    let requestBody: any = undefined;
    const rawBodyString = (options.body && typeof options.body === 'string') ? options.body : undefined;

    if (isFormDataBody) {
      requestBody = 'FormData (multipart/form-formdata)';
    } else if (rawBodyString) {
      try {
        requestBody = JSON.parse(rawBodyString); 
      } catch {
        requestBody = rawBodyString;
      }
    }
    // End Capture

    if (apiDebugLogger) {
      apiDebugLogger({
        endpoint,
        method: options.method || 'GET',
        status: 'pending',
        request: requestBody || 'No Body', 
      });
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const duration = Date.now() - startTime;
      const rawResponseText = await response.text();
      
      let responseData: any = null;
      
      try {
        responseData = rawResponseText ? JSON.parse(rawResponseText) : null;
      } catch (jsonError: any) {
        responseData = rawResponseText;
      }

      if (!response.ok) {
        const errorMessage = (responseData && typeof responseData === 'object' && responseData.message) || `HTTP ${response.status}: ${response.statusText}`;
        
        if (apiDebugLogger) {
          apiDebugLogger({
            endpoint,
            method: options.method || 'GET',
            status: 'error',
            statusCode: response.status,
            request: requestBody || 'No Body',
            response: responseData,
            error: errorMessage,
            duration,
          });
        }
        
        // Throw 401 error to be caught by global session handler (if implemented)
        throw { message: errorMessage, status: response.status };
      }

      if (apiDebugLogger) {
        apiDebugLogger({
          endpoint,
          method: options.method || 'GET',
          status: 'success', 
          statusCode: response.status,
          request: requestBody || 'No Body',
          duration,
        });
      }

      return responseData;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      if (apiDebugLogger && !error.status) {
        apiDebugLogger({
          endpoint,
          method: options.method || 'GET',
          status: 'error',
          request: requestBody || 'No Body',
          error: error.message || 'Network error',
          duration,
        });
      }
      throw error;
    }
  }

  // --- MODULES (CLEAN URLS) ---

  auth = {
    login: async (email: string, password: string) => this.request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: async (name: string, username: string, email: string, password: string) => this.request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify({ name, username, email, password }) }),
    logout: async () => this.request('/auth/logout', { method: 'POST' }),
    forgotPassword: async (email: string) => this.request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
    me: async () => this.request<{ user: any }>('/auth/me'),
  };

  home = {
    getFeed: async (page: number = 1, limit: number = 10, feedType: 'for-you' | 'following' = 'for-you') => this.request<{ posts: any[]; hasMore: boolean }>(`/home/feed?page=${page}&limit=${limit}&type=${feedType}`),
    getStories: async () => this.request<{ stories: any[] }>('/stories'),
  };

  posts = {
    getPost: async (id: string) => this.request<{ post: any }>(`/posts/details?post_id=${id}`), 
    create: async (formData: FormData) => this.request('/posts/create', { method: 'POST', body: formData }),
    delete: async (id: string) => this.request(`/posts/action/delete?id=${id}`, { method: 'POST', body: JSON.stringify({ post_id: id }) }),
    like: async (id: string) => this.request<{ isLiked: boolean; likes: number }>('/posts/action/like', { method: 'POST', body: JSON.stringify({ post_id: id }) }),
    unlike: async (id: string) => this.request<{ isLiked: boolean; likes: number }>('/posts/action/unlike', { method: 'POST', body: JSON.stringify({ post_id: id }) }),
    comment: async (id: string, content: string) => this.request('/posts/action/comment', { method: 'POST', body: JSON.stringify({ post_id: id, content }) }),
    getComments: async (id: string, page: number = 1) => this.request<{ comments: any[] }>(`/posts/comments?post_id=${id}&page=${page}`),
    deleteComment: async (commentId: string) => this.request(`/posts/action/comment?comment_id=${commentId}`, { method: 'DELETE' }),
    share: async (id: string) => this.request(`/posts/action/share`, { method: 'POST', body: JSON.stringify({ post_id: id }) }),
    report: async (postId: string, reason: string, description?: string) => this.request('/posts/action/report', { method: 'POST', body: JSON.stringify({ post_id: postId, reason, description }) }),
  };

  reels = {
    getReels: async (page: number = 1, limit: number = 10) => this.request<{ reels: any[]; hasMore: boolean }>(`/reels?page=${page}&limit=${limit}`),
    getDetails: async (id: string) => this.request<{ reel: any }>(`/reels/details?id=${id}`),
    like: async (id: string) => this.request('/reels/action/like', { method: 'POST', body: JSON.stringify({ reel_id: id }) }),
    unlike: async (id: string) => this.request('/reels/action/unlike', { method: 'POST', body: JSON.stringify({ reel_id: id }) }),
    comment: async (id: string, content: string) => this.request('/reels/action/comment', { method: 'POST', body: JSON.stringify({ reel_id: id, content }) }),
    getComments: async (id: string, page: number = 1) => this.request<{ comments: any[] }>(`/reels/comments?reel_id=${id}&page=${page}`),
    deleteComment: async (commentId: string) => this.request(`/reels/action/comment?comment_id=${commentId}`, { method: 'DELETE' }),
    share: async (id: string) => this.request(`/reels/action/share`, { method: 'POST', body: JSON.stringify({ reel_id: id }) }),
    report: async (reelId: string, reason: string) => this.request('/reels/action/report', { method: 'POST', body: JSON.stringify({ reel_id: reelId, reason }) }),
    delete: async (id: string) => this.request(`/posts/action/delete?id=${id}`, { method: 'POST', body: JSON.stringify({ post_id: id, type: 'reel' }) }),
    upload: async (formData: FormData) => this.request('/reels/upload', { method: 'POST', body: formData }),
    trackView: async (reelId: string, watchDuration: number, totalDuration: number) => {
      return this.request('/reels/track-view', {
        method: 'POST',
        body: JSON.stringify({ reel_id: reelId, watch_duration: watchDuration, total_duration: totalDuration })
      });
    }
  };

  videos = {
    getVideos: async (page: number = 1, limit: number = 10, category?: string) => {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (category && category !== 'All') params.append('category', category);
      return this.request<{ videos: any[]; hasMore: boolean }>(`/videos?${params.toString()}`);
    },
    getRecommended: async (videoId: string) => this.request<{ videos: any[] }>(`/videos/recommended?video_id=${videoId}`),
    trackWatch: async (videoId: string, watchDuration: number, completionRate: number) => {
      return this.request('/videos/track-watch', {
        method: 'POST',
        body: JSON.stringify({ video_id: videoId, video_type: 'video', watch_duration: watchDuration, completion_rate: completionRate })
      });
    },
    view: async (id: string) => this.request(`/videos/action/view`, { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    like: async (id: string) => this.request<{ isLiked: boolean; likes: number }>('/videos/action/like', { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    unlike: async (id: string) => this.request<{ isLiked: boolean; likes: number }>('/videos/action/unlike', { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    dislike: async (id: string) => this.request<{ isDisliked: boolean }>('/videos/action/dislike', { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    undislike: async (id: string) => this.request<{ isDisliked: boolean }>('/videos/action/undislike', { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    comment: async (id: string, content: string) => this.request('/videos/action/comment', { method: 'POST', body: JSON.stringify({ video_id: id, content }) }),
    getComments: async (id: string, page: number = 1) => this.request<{ comments: any[] }>(`/videos/comments?video_id=${id}&page=${page}`),
    share: async (id: string) => this.request(`/videos/action/share`, { method: 'POST', body: JSON.stringify({ video_id: id }) }),
    upload: async (formData: FormData) => this.request('/videos/upload', { method: 'POST', body: formData }),
    getDetails: async (id: string) => this.request<{ video: any }>(`/videos/details?id=${id}`),
    search: async (query: string, page: number = 1, limit: number = 20) => {
        const params = new URLSearchParams({ q: encodeURIComponent(query), page: page.toString(), limit: limit.toString() });
        return this.request<{ videos: any[]; total: number }>(`/videos/search?${params.toString()}`);
    },
    report: async (videoId: string, reason: string = 'Inappropriate', description?: string) => {
      return this.request('/videos/action/report', { 
        method: 'POST',
        body: JSON.stringify({ video_id: videoId, reason, description }),
      });
    },
    save: async (videoId: string) => {
        return this.request<{ isSaved: boolean }>('/videos/action/save', { 
            method: 'POST',
            body: JSON.stringify({ video_id: videoId }),
        });
    },
    delete: async (videoId: string) => {
      return this.request('/videos/action/delete', { 
          method: 'POST', 
          body: JSON.stringify({ video_id: videoId }),
      });
    },
  };

  ads = {
    trackImpression: async (data: { video_id: string; creator_id: string; ad_network: string; revenue: number }) => this.request('/ads/track-impression', { method: 'POST', body: JSON.stringify(data) }),
  };

  users = {
    getProfile: async (userId: string) => this.request<{ user: any }>(`/users/fetch_profile?user_id=${userId}`),
    updateProfile: async (formData: FormData) => this.request<{ user: any }>('/users/edit_profile', { method: 'POST', body: formData }),
    uploadAvatar: async (formData: FormData) => this.request('/users/avatar', { method: 'POST', body: formData }),
    uploadCover: async (formData: FormData) => this.request('/users/cover', { method: 'POST', body: formData }),
    follow: async (userId: string) => this.request<{ isFollowing: boolean }>('/users/action/follow', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
    unfollow: async (userId: string) => this.request<{ isFollowing: boolean }>('/users/action/unfollow', { method: 'POST', body: JSON.stringify({ user_id: userId }) }),
    getFollowers: async (userId: string, page: number = 1) => this.request(`/users/followers?user_id=${userId}&page=${page}`),
    getFollowing: async (userId: string, page: number = 1) => this.request(`/users/following?user_id=${userId}&page=${page}`),
    getPosts: async (userId: string, page: number = 1) => this.request<{ posts: any[]; hasMore: boolean }>(`/users/posts?user_id=${userId}&page=${page}`),
    getReels: async (userId: string, page: number = 1) => this.request<{ reels: any[] }>(`/users/reels?user_id=${userId}&page=${page}`),
    getVideos: async (userId: string, page: number = 1) => this.request(`/users/videos?user_id=${userId}&page=${page}`),
  };

  channels = {
    checkUserChannel: async (userId: string) => this.request(`/channels/check-user-channel?user_id=${userId}`),
    getChannel: async (channelId: string) => this.request<{ channel: any }>(`/channels/details?id=${channelId}`),
    getVideos: async (channelId: string, page: number = 1) => this.request(`/channels/videos?channel_id=${channelId}&page=${page}`),
    getReels: async (channelId: string, page: number = 1) => this.request(`/channels/reels?channel_id=${channelId}&page=${page}`),
    subscribe: async (channelId: string) => this.request<{ isSubscribed: boolean }>('/channels/action/subscribe', { method: 'POST', body: JSON.stringify({ channel_id: channelId }) }),
    unsubscribe: async (channelId: string) => this.request<{ isSubscribed: boolean }>('/channels/action/unsubscribe', { method: 'POST', body: JSON.stringify({ channel_id: channelId }) }),
    create: async (data: any) => this.request('/channels/create', { method: 'POST', body: JSON.stringify(data) }),
    updateChannel: async (formData: FormData) => this.request('/channels/update', { method: 'POST', body: formData }),
  };
  
  creator = {
    getStats: async () => this.request<{ stats: any }>('/creator/stats'),
    getEarnings: async (period: 'week' | 'month' | 'year' = 'month') => this.request<{ earnings: any }>(`/creator/earnings?period=${period}`),
    getContent: async (type: 'posts' | 'reels' | 'videos', page: number = 1) => this.request<{ content: any[]; hasMore: boolean }>(`/creator/content/${type}?page=${page}`),
    getVideoDetailedAnalytics: async (videoId: string) => this.request<{ analytics: any }>(`/creator/video-details-analytics?video_id=${videoId}`),
  };

  search = {
      all: async (query: string, page: number = 1) => this.request<{ users: any[]; posts: any[] }>(`/search?q=${encodeURIComponent(query)}&page=${page}`),
      users: async (query: string, page: number = 1) => this.request<{ users: any[] }>(`/search/users?q=${encodeURIComponent(query)}&page=${page}`),
      posts: async (query: string, page: number = 1) => this.request<{ posts: any[] }>(`/search/posts?q=${encodeURIComponent(query)}&page=${page}`),
      hashtags: async (tag: string, page: number = 1) => this.request<{ posts: any[] }>(`/search/hashtags?tag=${encodeURIComponent(tag)}&page=${page}`),
  };

  // <<< FINAL MODULE: SETTINGS >>>
  settings = {
      // --- PRIVACY & VISIBILITY ---
      getPrivacySettings: async () => this.request('/settings/privacy?action=get'),
      updatePrivacySettings: async (data: any) => this.request('/settings/privacy?action=update', { 
          method: 'POST', 
          body: JSON.stringify(data) 
      }),
      
      // --- PASSWORD & 2FA ---
      changePassword: async (currentPassword: string, newPassword: string) => this.request('/settings/security/change-password', { 
          method: 'POST', 
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) 
      }),
      // 2FA Calls (Path: /settings/security/2fa/...)
      get2FAStatus: async () => this.request('/settings/security/2fa/status'),
      generate2FASecret: async () => this.request('/settings/security/2fa/generate-secret', { method: 'POST' }),
      enable2FA: async (secret: string, code: string) => this.request('/settings/security/2fa/enable', { 
          method: 'POST', 
          body: JSON.stringify({ secret: secret, code: code }) 
      }),
      disable2FA: async (code: string) => this.request('/settings/security/2fa/disable', { 
          method: 'POST', 
          body: JSON.stringify({ code: code }) 
      }),

      // --- E2EE KEY MANAGEMENT (Future Use) ---
      backupKey: async () => this.request('/settings/security/e2ee/backup', { method: 'POST' }),
      generateNewKey: async () => this.request('/settings/security/e2ee/generate-new', { method: 'POST' }),
      setRecoveryPhrase: async (phrase: string) => this.request('/settings/security/e2ee/set-recovery', { 
          method: 'POST', 
          body: JSON.stringify({ recovery_phrase: phrase }) 
      }),
      
      // --- NOTIFICATIONS ---
      getNotifications: async () => this.request('/settings/notifications?action=get'),
      updateNotifications: async (data: any) => this.request('/settings/notifications?action=update', { 
          method: 'POST', 
          body: JSON.stringify(data) 
      }),

      // --- ADS & DATA ---
      getAdPreferences: async () => this.request('/settings/ads/preferences?action=get'),
      updateAdPreferences: async (data: any) => this.request('/settings/ads/preferences?action=update', { 
          method: 'POST', 
          body: JSON.stringify(data) 
      }),
      clearAdHistory: async () => this.request('/settings/ads/clear-history', { method: 'POST' }),
      getAdHistory: async () => this.request('/settings/ads/history'),

      // --- USER MANAGEMENT (BLOCKED) ---
      // GET List: /settings/blocked
      getBlockedUsers: async () => this.request('/settings/blocked'),
      
      // POST Unblock: /settings/users/unblock (Uses 'user_id' key)
      unblockUser: async (userId: string) => this.request('/settings/users/unblock', { 
          method: 'POST', 
          body: JSON.stringify({ user_id: userId }) 
      }),
      
      // --- DATA EXPORT ---
      getDataExportRequests: async () => this.request('/settings/data/requests'),
      requestDataExport: async (format: string) => this.request('/settings/data/request-export', { 
          method: 'POST', 
          body: JSON.stringify({ format: format }) 
      }),

      // --- GENERAL ---
      updateLanguage: async (langCode: string) => this.request('/settings/general/language', { 
          method: 'POST', 
          body: JSON.stringify({ language_code: langCode }) 
      }),
  }

}

export const api = new ApiClient(API_BASE_URL, MEDIA_BASE_URL);
export { API_BASE_URL, MEDIA_BASE_URL };
