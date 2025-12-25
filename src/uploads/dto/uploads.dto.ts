import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

export const uploadPurposesSchema = z.enum([
  'product_image',
  'user_avatar',
])

const preSignUploadSchema = z.object({
  purpose: uploadPurposesSchema,
  contentType: z.string().min(1),
  size: z.number().positive().optional(),
})

export class PreSignUploadDto extends createZodDto(preSignUploadSchema) {}
