import { validateRateLimit } from "@/utils/validation";

/**
 * Generic rate limiter for API Route Handlers (App Router).
 * Uses in-memory store (non-distributed). For production, swap with Redis.
 *
 * @param {Request} req - Incoming request
 * @param {Object} options
 * @param {string} options.action - Action bucket (e.g., 'login','question','answer','comment','vote','search')
 * @param {number} [options.status=429] - Status code for limit exceeded
 * @param {string} [options.message='Too many requests, please try again later.'] - Response message
 * @param {string} [options.identifier] - Explicit identifier override
 * @returns {object|null} - If limited returns { limited:true, response }, else null
 */
export function rateLimit(req, { action, status = 429, message = 'Too many requests, please try again later.', identifier } = {}) {
  try {
    if (!action) action = 'default';
    let key = identifier;
    if (!key) {
      // Attempt to derive client IP (best-effort)
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip') || 'anon';
      key = ip;
    }
    const allowed = validateRateLimit(key, action);
    if (!allowed) {
      return {
        limited: true,
        response: new Response(JSON.stringify({ status, message }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      };
    }
    return null;
  } catch (err) {
    // Fails open (no blocking) to avoid accidental outage
    return null;
  }
}
