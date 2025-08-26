import { NextRequest } from "next/server";

interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

const rateLimitMap = new Map<string, number[]>();

export function rateLimit(
  options: RateLimitOptions = { limit: 10, windowMs: 60000 }
) {
  return (req: NextRequest): boolean => {
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";
    const now = Date.now();
    const windowStart = now - options.windowMs;

    if (!rateLimitMap.has(ip)) {
      rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap
      .get(ip)!
      .filter((time: number) => time > windowStart);

    if (requests.length >= options.limit) {
      return false;
    }

    requests.push(now);
    rateLimitMap.set(ip, requests);
    return true;
  };
}

// Clean up old entries periodically
setInterval(
  () => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [ip, requests] of rateLimitMap.entries()) {
      const validRequests = requests.filter(
        (time: number) => now - time < maxAge
      );
      if (validRequests.length === 0) {
        rateLimitMap.delete(ip);
      } else {
        rateLimitMap.set(ip, validRequests);
      }
    }
  },
  60 * 60 * 1000
); // Clean up every hour
