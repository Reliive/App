import axios from 'axios';

/**
 * Converts unknown request failures into actionable messages without relying
 * on unsafe casts at service or screen boundaries.
 */
export function getErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }
    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}
