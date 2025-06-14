import axios from "axios";


export type ProcessedError = {
  message: string;
  code: string;
  details?: any; // The optional
};


interface BackendErrorResponse {
  success: boolean;
  message: string;
  code: string;
  details: string | null;
}


export function processApiError(error: unknown): ProcessedError {
  if (axios.isAxiosError(error) && error.response) {
    const errorData = error.response.data as BackendErrorResponse;
    return {
      message: errorData.message || 'An API error occurred.',
      code: errorData.code || 'UNKNOWN_API_ERROR',
      details: errorData.details,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR',
    };
  }

  return {
    message: 'An unknown error occurred. Please try again.',
    code: 'UNKNOWN',
  };
}