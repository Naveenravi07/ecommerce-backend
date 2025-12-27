import {z} from 'zod';
import { createZodDto } from 'nestjs-zod'


const CreateCategorySchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.number().optional().nullable(),
});
export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export const CreateCategoryResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().nullable(),
});
export class CreateCategoryResponseDto extends createZodDto(CreateCategoryResponseSchema) {}