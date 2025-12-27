export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
    shouldRetry?: (error: any) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    shouldRetry = defaultShouldRetry,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      console.warn(`[Retry] Attempt ${attempt}/${maxAttempts} failed:`, error?.message || error);

      if (attempt >= maxAttempts || !shouldRetry(error)) {
        throw error;
      }

      await sleep(Math.min(delay, maxDelay));
      delay *= backoffMultiplier;
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function defaultShouldRetry(error: any): boolean {
  const errorMessage = error?.message || String(error);
  const retryablePatterns = [
    /network/i,
    /timeout/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ECONNRESET/i,
    /502/i,
    /503/i,
    /504/i,
  ];

  return retryablePatterns.some(pattern => pattern.test(errorMessage));
}
