interface Metrics {
  shares_count: number;
  comments_count: number;
  likes_count: number;
  dislikes_count: number;
  created_at: string;
}

const E_MAX = 10000;
const MILLIS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateViralityScore = (data: Metrics): number => {
  const shares = Number(data.shares_count) || 0;
  const comments = Number(data.comments_count) || 0;
  const likes = Number(data.likes_count) || 0;
  const dislikes = Number(data.dislikes_count) || 0;
  const createdAt = new Date(data.created_at);

  const E_T = (10 * shares) + (5 * comments) + (2 * likes) - (3 * dislikes);

  const now = new Date();
  const ageDays = (now.getTime() - createdAt.getTime()) / MILLIS_PER_DAY;
  
  const A_Decay = Math.pow(0.5, (ageDays / 7));

  const rawScore = (E_T * A_Decay) / E_MAX;
  const finalScore = Math.min(100, rawScore * 100);

  return Math.max(0, finalScore);
};
