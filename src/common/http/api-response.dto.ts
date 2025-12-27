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


type ZodDtoClass = {
  schema: ZodTypeAny;
};

export function apiSuccessResponseDto(
  dataDtoOrSchema: ZodTypeAny | ZodDtoClass,
  name?: string,
) {
  const dataSchema =
    'schema' in dataDtoOrSchema
      ? dataDtoOrSchema.schema
      : dataDtoOrSchema;

  const schema = apiSuccessResponseSchema(dataSchema);
  const Dto = createZodDto(schema as any);

  Object.defineProperty(Dto, 'name', {
    value: name ?? `ApiSuccessResponse`,
  });

  return Dto;
}


export function apiErrorsResponseDto<T extends ZodTypeAny>(
  dataDtoOrSchema: ZodTypeAny | ZodDtoClass,
  name?: string,
) {
  const dataSchema =
    'schema' in dataDtoOrSchema
      ? dataDtoOrSchema.schema
      : dataDtoOrSchema;
  const schema = apiErrorResponseSchema(dataSchema);
  const Dto = createZodDto(schema as any);

  Object.defineProperty(Dto, 'name', {
    value: name ?? `ApiErrorResponse`,
  });

  return Dto;
}
