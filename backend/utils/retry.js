export async function retryOperation(operation, maxRetries = 3, retryDelay = 1000, retries = 0) {
  try {
    return await operation();
  } catch (error) {
    if (retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, retryDelay * (retries + 1)));
      return retryOperation(operation, maxRetries, retryDelay, retries + 1);
    }
    throw error;
  }
}
