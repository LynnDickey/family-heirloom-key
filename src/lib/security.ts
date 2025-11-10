// Security utilities for input sanitization and validation

/**
 * Sanitizes string input to prevent XSS attacks
 */
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';

  return input
    .replace(/[<>&"']/g, (char) => {
      const entityMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#x27;'
      };
      return entityMap[char] || char;
    })
    .trim()
    .substring(0, 1000); // Prevent extremely long inputs
};

/**
 * Validates Ethereum address format
 */
export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validates deadline is reasonable (not too far in future)
 */
export const isValidDeadline = (deadline: Date): boolean => {
  const now = new Date();
  const minDeadline = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
  const maxDeadline = new Date(now.getTime() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years

  return deadline >= minDeadline && deadline <= maxDeadline;
};

/**
 * Validates ETH amount is reasonable
 */
export const isValidEthAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num >= 0 && num <= 10000; // Max 10k ETH
};

/**
 * Rate limiting helper to prevent spam
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside the window
    const validAttempts = attempts.filter(time => now - time < windowMs);

    if (validAttempts.length >= maxAttempts) {
      return false;
    }

    validAttempts.push(now);
    this.attempts.set(key, validAttempts);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
