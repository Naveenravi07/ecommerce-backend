import { HttpStatus } from '@nestjs/common';

export type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  requestId?: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

export type ApiErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
  timestamp: string;
  path?: string;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;



export function httpStatusToCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'BAD_REQUEST';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.CONFLICT:
      return 'CONFLICT';
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return 'UNPROCESSABLE_ENTITY';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'TOO_MANY_REQUESTS';
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'INTERNAL_SERVER_ERROR';
    case HttpStatus.BAD_GATEWAY:
      return 'BAD_GATEWAY';
    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'SERVICE_UNAVAILABLE';
    case HttpStatus.GATEWAY_TIMEOUT:
      return 'GATEWAY_TIMEOUT';
    default:
      if (status >= 500) return 'INTERNAL_SERVER_ERROR';
      if (status >= 400) return 'BAD_REQUEST';
      return 'OK';
  }
}
