import { createZodDto } from 'nestjs-zod';
import {z} from 'zod';

const listProductsSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(40).default(10),
    search: z.string().optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    categories: z.array(z.string()).optional(),
    sortBy: z.enum(['price-low','price-high']).optional()
});
export class ListProductsDto extends createZodDto(listProductsSchema) {}


const createProductSchema = z.object({
    
});
export class CreateProductDto extends createZodDto(createProductSchema) {}