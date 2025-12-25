import { createZodDto } from 'nestjs-zod';
import { z, ZodTypeAny } from 'zod';

export const apiSuccessResponseSchema = <TDataSchema extends ZodTypeAny>(
  dataSchema: TDataSchema,
) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    requestId: z.string().optional(),
    timestamp: z.string(),
  });

export const apiErrorResponseSchema = <TDataSchema extends ZodTypeAny>(
  dataSchema: TDataSchema,
) => z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
  }),
  requestId: z.string().optional(),
  timestamp: z.string(),
  path: z.string().optional(),
});


export function apiSuccessResponseDto(dataDtoOrSchema: unknown): any {
  const dataSchema: ZodTypeAny =
    (dataDtoOrSchema as any)?.schema ?? (dataDtoOrSchema as any);

  const schema = apiSuccessResponseSchema(dataSchema);
  return createZodDto(schema as any);
}

export function apiErrorsResponseDto(dataDtoOrSchema: unknown): any {
  const dataSchema: ZodTypeAny =
    (dataDtoOrSchema as any)?.schema ?? (dataDtoOrSchema as any);

  const schema = apiErrorResponseSchema(dataSchema);
  return createZodDto(schema as any);
}