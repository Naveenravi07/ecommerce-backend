import { createZodDto } from 'nestjs-zod'
import {z} from 'zod'

const preSignUploadSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
})
export class PreSignUploadDto extends createZodDto(preSignUploadSchema){}