import { url } from 'inspector';
import { isPassedLogger } from 'nestjs-pino/params';
import { createZodDto } from 'nestjs-zod';
import {z} from 'zod';

const sizeEnumSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);

const listProductsSchema = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(40).default(10),
    search: z.string().optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    categories: z.array(z.number()).optional(),
    sortBy: z.enum(['price-low','price-high']).optional()
});
export class ListProductsDto extends createZodDto(listProductsSchema) {}


const createProductSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(3).max(100),
    categoryId: z.number(),
    featured: z.boolean().default(false),
    shippingfee: z.number().default(0),
    productDetails: z.record(z.string(), z.string()),
    colors: z.array(z.object({
        name: z.string(),
        hexCode: z.string(),
        images: z.array(z.object({
            url: z.string().url(),
            isPrimary: z.boolean().default(false),
        })),
        variants: z.array(z.object({
            price: z.number(),
            offerPrice: z.number().optional(),
            stock: z.number().default(0),
            size: sizeEnumSchema,
            isPrimary: z.boolean().default(false),
        }))
    })),
})
export class CreateProductDto extends createZodDto(createProductSchema) {}

export const createProductResponseSchema = z.object({
    id: z.number(),
});
export class CreateProductResponseDto extends createZodDto(createProductResponseSchema) {}