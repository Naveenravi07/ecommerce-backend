import { createZodDto } from 'nestjs-zod';
import {z} from 'zod';

const sizeEnumSchema = z.enum(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']);

const listProductsSchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(40).default(10),
    search: z.string().optional(),
    priceMin: z.coerce.number().min(0).optional(),
    priceMax: z.coerce.number().min(0).optional(),
    categories: z.array(z.coerce.number()).optional(),
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
        })).min(1)
    })).min(1),
})
export class CreateProductDto extends createZodDto(createProductSchema) {}

export const createProductResponseSchema = z.object({
    id: z.number(),
});
export class CreateProductResponseDto extends createZodDto(createProductResponseSchema) {}

const productImageSchema = z.object({
    id: z.number(),
    url: z.string(),
});

const productCategorySchema = z.object({
    id: z.number().nullable(),
    name: z.string().nullable(),
});

export const productItemSchema = z.object({
    id: z.number(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    shippingfee: z.number(),
    category: productCategorySchema,
    featured: z.boolean(),
    stock: z.number().nullable(),
    images: z.array(productImageSchema),
    primaryImageId: z.number().nullable(),
    offerPrice: z.number().nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
});

const paginationSchema = z.object({
    currentPage: z.number(),
    totalPages: z.number(),
    totalItems: z.number(),
    itemsPerPage: z.number(),
    hasNextPage: z.boolean(),
    hasPrevPage: z.boolean(),
});

const filtersSchema = z.object({
    search: z.string().nullable(),
    categories: z.array(z.number()).nullable(),
    priceMin: z.number().nullable(),
    priceMax: z.number().nullable(),
    sortBy: z.enum(['price-low', 'price-high']).nullable(),
});

export const listProductsResponseSchema = z.object({
    items: z.array(productItemSchema),
    pagination: paginationSchema,
    filters: filtersSchema,
});
export class ListProductsResponseDto extends createZodDto(listProductsResponseSchema) {}

// Get Product by ID
const getProductParamsSchema = z.object({
  id: z.coerce.number().min(1),
});
export class GetProductParamsDto extends createZodDto(getProductParamsSchema) {}

const variantSchema = z.object({
  id: z.number(),
  size: sizeEnumSchema,
  price: z.number(),
  offerPrice: z.number().nullable(),
  stock: z.number(),
});

const colorSchema = z.object({
  id: z.number(),
  name: z.string(),
  hexCode: z.string().nullable(),
  primaryImageId: z.number().nullable(),
  images: z.array(productImageSchema),
  variants: z.array(variantSchema),
});

export const getProductResponseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  shippingfee: z.number(),
  featured: z.boolean(),
  productDetails: z.record(z.string(), z.string()),
  category: productCategorySchema,
  primaryVariantId: z.number().nullable(),
  colors: z.array(colorSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export class GetProductResponseDto extends createZodDto(getProductResponseSchema) {}
