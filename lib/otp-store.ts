import * as fs from 'fs';
import * as path from 'path';

// Shared OTP storage across routes
// In-memory storage for development, Redis for production
export const otpStore = new Map<string, { code: string; expiresAt: number }>();

export const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// File-based storage for development (survives hot-reloads)
const OTP_FILE = path.join(process.cwd(), '.otp-store.json');

function loadOTPFromFile(): Map<string, { code: string; expiresAt: number }> {
  try {
    if (fs.existsSync(OTP_FILE)) {
      const data = JSON.parse(fs.readFileSync(OTP_FILE, 'utf-8'));
      const map = new Map<string, { code: string; expiresAt: number }>(data);
      console.log('[OTP] Loaded from file:', Array.from(map.keys()));
      return map;
    }
  } catch (error) {
    console.error('[OTP] Error loading file:', error);
  }
  return new Map();
}

function saveOTPToFile(store: Map<string, { code: string; expiresAt: number }>) {
  try {
    const data = Array.from(store.entries());
    fs.writeFileSync(OTP_FILE, JSON.stringify(data), 'utf-8');
    console.log('[OTP] Saved to file:', Array.from(store.keys()));
  } catch (error) {
    console.error('[OTP] Error saving file:', error);
  }
}

// Load OTP from file on startup (development only)
if (process.env.NODE_ENV === 'development') {
  const fileStore = loadOTPFromFile();
  fileStore.forEach((value, key) => {
    otpStore.set(key, value);
  });
}

export async function getOTP(email: string): Promise<string | null> {
  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();
  
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      const getRedisClient = (await import('@/lib/redis')).default;
      const redis = await getRedisClient;
      const otpKey = `otp:${normalizedEmail}`;
      const otp = await redis.get(otpKey);
      console.log('[OTP] Redis - getOTP for', normalizedEmail, '- Found:', !!otp);
      return otp;
    } catch (error) {
      console.error('[OTP] Redis error:', error);
      // Fall back to memory
      const data = otpStore.get(normalizedEmail);
      const result = data && Date.now() <= data.expiresAt ? data.code : null;
      console.log('[OTP] Fallback - getOTP for', normalizedEmail, '- Found:', !!result, '- Expires at:', data?.expiresAt, '- Now:', Date.now());
      return result;
    }
  } else {
    // Development: check in-memory (persisted to file)
    const data = otpStore.get(normalizedEmail);
    const result = data && Date.now() <= data.expiresAt ? data.code : null;
    console.log('[OTP] Dev - getOTP for', normalizedEmail, '- Found:', !!result, '- Data:', data, '- Expires at:', data?.expiresAt, '- Now:', Date.now(), '- All keys:', Array.from(otpStore.keys()));
    return result;
  }
}

export async function storeOTP(email: string, otp: string, expirySeconds: number = 300): Promise<void> {
  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log('[OTP] Storing OTP for', normalizedEmail, '- OTP:', otp, '- Expires in:', expirySeconds, 'seconds');
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      const getRedisClient = (await import('@/lib/redis')).default;
      const redis = await getRedisClient;
      const otpKey = `otp:${normalizedEmail}`;
      await redis.set(otpKey, otp, { EX: expirySeconds });
      console.log('[OTP] Redis - Stored successfully');
    } catch (error) {
      console.error('[OTP] Redis error - falling back to memory:', error);
      otpStore.set(normalizedEmail, {
        code: otp,
        expiresAt: Date.now() + expirySeconds * 1000,
      });
    }
  } else {
    // Development: use in-memory storage (persisted to file)
    otpStore.set(normalizedEmail, {
      code: otp,
      expiresAt: Date.now() + expirySeconds * 1000,
    });
    saveOTPToFile(otpStore);
    console.log('[OTP] Dev - Stored in memory - Current store keys:', Array.from(otpStore.keys()), '- Store content:', Array.from(otpStore.entries()));
  }
}

export async function deleteOTP(email: string): Promise<void> {
  // Normalize email to lowercase for consistency
  const normalizedEmail = email.toLowerCase().trim();
  
  if (process.env.NODE_ENV === 'production' && process.env.REDIS_URL) {
    try {
      const getRedisClient = (await import('@/lib/redis')).default;
      const redis = await getRedisClient;
      const otpKey = `otp:${normalizedEmail}`;
      await redis.del(otpKey);
    } catch (error) {
      console.error('[OTP] Redis error:', error);
    }
  }
  otpStore.delete(normalizedEmail);
  if (process.env.NODE_ENV === 'development') {
    saveOTPToFile(otpStore);
  }
}
