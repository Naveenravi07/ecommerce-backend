import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiErrorResponse, httpStatusToCode } from './api-response';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string }>();
    const res = ctx.getResponse<Response>();

    const requestId =
      req.id ?? (req.headers['x-request-id'] as string | undefined);

    if (requestId) {
      res.setHeader('x-request-id', requestId);
    }

    const timestamp = new Date().toISOString();
    const path = req.originalUrl ?? req.url;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = httpStatusToCode(status);
    let message = 'Internal server error';
    let details: unknown = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = httpStatusToCode(status);

      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (response && typeof response === 'object') {
        const r = response as Record<string, unknown>;

        const respMessage = r.message;
        if (typeof respMessage === 'string') {
          message = respMessage;
        } else if (Array.isArray(respMessage)) {
          message = 'Validation failed';
          details = respMessage;
        } else if (typeof r.error === 'string') {
          message = r.error;
        }

        if (r.details !== undefined) {
          details = r.details;
        } else if (details === undefined) {
          const { message: _m, error: _e, statusCode: _s, ...rest } = r;
          if (Object.keys(rest).length > 0) {
            details = rest;
          }
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message || message;
    } else if (typeof exception === 'string') {
      message = exception;
    }

    const body: ApiErrorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details !== undefined ? { details } : {}),
      },
      requestId,
      timestamp,
      path,
    };

    res.status(status).json(body);
  }
}
