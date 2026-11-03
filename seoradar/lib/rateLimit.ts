/**
 * Basit, bellek-içi günlük kullanım sayacı.
 * Ücretsiz plan: günde FREE_DAILY_LIMIT analiz.
 * Üretimde bunun yerine Redis / KV / DB tabanlı bir sayaç kullanın.
 */

export const FREE_DAILY_LIMIT = 3;

interface Bucket {
  date: string;
  count: number;
}

const store = new Map<string, Bucket>();

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUsage(key: string): { used: number; limit: number } {
  const day = today();
  const bucket = store.get(key);
  if (!bucket || bucket.date !== day) return { used: 0, limit: FREE_DAILY_LIMIT };
  return { used: bucket.count, limit: FREE_DAILY_LIMIT };
}

export function consume(key: string): { used: number; limit: number; allowed: boolean } {
  const day = today();
  const bucket = store.get(key) ?? { date: day, count: 0 };
  if (bucket.date !== day) {
    bucket.date = day;
    bucket.count = 0;
  }
  if (bucket.count >= FREE_DAILY_LIMIT) {
    store.set(key, bucket);
    return { used: bucket.count, limit: FREE_DAILY_LIMIT, allowed: false };
  }
  bucket.count += 1;
  store.set(key, bucket);
  return {
    used: bucket.count,
    limit: FREE_DAILY_LIMIT,
    allowed: true,
  };
}