/**
 * AI Timeout Wrapper - Prevents hanging AI calls
 * Provides consistent timeout handling and retry logic for all AI services
 */

export class AITimeoutWrapper {
  private static readonly TIMEOUT_MS = 30000; // 30 seconds
  private static readonly RETRY_ATTEMPTS = 2;

  /**
   * Execute LLM call with timeout and retry logic
   */
  static async callLLMWithTimeout(prompt: string, model = 'gpt-4o', jsonMode = true): Promise<string> {
    for (let attempt = 1; attempt <= this.RETRY_ATTEMPTS; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), this.TIMEOUT_MS);
        });

        const llmPromise = spark.llm(prompt, model, jsonMode);
        const response = await Promise.race([llmPromise, timeoutPromise]);
        return response;
      } catch (error) {
        console.warn(`LLM call attempt ${attempt} failed:`, error);
        if (attempt === this.RETRY_ATTEMPTS) {
          throw error;
        }
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    throw new Error('All retry attempts failed');
  }

  /**
   * Safe wrapper for AI calls that provides fallback values on timeout
   */
  static async safeAICall<T>(
    aiFunction: () => Promise<T>, 
    fallback: T, 
    context: string = 'AI operation'
  ): Promise<T> {
    try {
      return await aiFunction();
    } catch (error) {
      const isTimeout = error instanceof Error && error.message.includes('timeout');
      console.warn(`${context} ${isTimeout ? 'timed out' : 'failed'}:`, error);
      return fallback;
    }
  }
}

/**
 * Global helper function for components to use directly
 */
export const callAIWithTimeout = AITimeoutWrapper.callLLMWithTimeout.bind(AITimeoutWrapper);
export const safeAICall = AITimeoutWrapper.safeAICall.bind(AITimeoutWrapper);