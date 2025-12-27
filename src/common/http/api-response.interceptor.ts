import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, map } from 'rxjs';


@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpCtx = context.switchToHttp();
    const req = httpCtx.getRequest<Request & { id?: string }>();
    const res = httpCtx.getResponse<Response>();

    const requestId =
      req.id ?? (req.headers['x-request-id'] as string | undefined);

    if (requestId) {
      res.setHeader('x-request-id', requestId);
    }

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        requestId,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
