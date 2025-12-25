import { Inject, Injectable } from '@nestjs/common';
import { ListProductsDto } from './dto/product.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import {
  products,
  productColorImages,
  productColors,
  productVariants,
} from './schema';
import { categories as catSchema } from '../categories/schema';

import { eq, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database-connection';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<
      | typeof products
      | typeof productColors
      | typeof productColorImages
      | typeof productVariants
      | typeof catSchema
    >,
  ) {}

  async listProducts(data: ListProductsDto) {
    const { page, limit, search, priceMin, priceMax, categories, sortBy } =
      data;

    const searchLower = search?.toLowerCase();
    const offset = (page - 1) * limit;
    let whereCondition = sql`${products.deleted} = false`;
    let orderByCondition = sql``;

    const [{ count }] = await this.db
      .select({
        count: sql<number>`cast(count(DISTINCT ${products.id}) as int)`,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(whereCondition);

    if (search) {
      whereCondition = sql`${whereCondition} AND (
              LOWER(${products.title}) LIKE ${`%${searchLower}%`} OR
              LOWER(${products.description}) LIKE ${`%${searchLower}%`}
            )`;
    }

    if (categories && categories.length > 0) {
      let catIds = this.db
        .select(catSchema.id)
        .from(catSchema)
        .where(catSchema.name.in(categories));
      whereCondition = sql`${whereCondition} AND ${products.categoryId} = ANY($<number[]>${catIds})`;
    }

    if (priceMin) {
      whereCondition = sql`${whereCondition} 
            AND ${products.id} IN (SELECT ${productVariants.productId} 
            FROM ${productVariants} WHERE COALESCE(${productVariants.offerPrice},${productVariants.price}) >= ${priceMin}
            )`;
    }

    if (priceMax) {
      whereCondition = sql`${whereCondition} 
            AND ${products.id} IN (SELECT ${productVariants.productId} 
            FROM ${productVariants} WHERE COALESCE(${productVariants.offerPrice},${productVariants.price}) <= ${priceMax}
            )`;
    }

    if (sortBy) {
      switch (sortBy) {
        case 'price-high':
          orderByCondition = sql`${orderByCondition} ORDER BY ${productVariants.price} DESC`;
          break;
        case 'price-low':
          orderByCondition = sql`${orderByCondition} ORDER BY ${productVariants.price} ASC`;
          break;
      }
    }

    const result = await this.db
      .select()
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(whereCondition)
      .orderBy(orderByCondition)
      .limit(limit)
      .offset(offset);

    console.log(result);
    return {
      products: result,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(Number(count) / limit),
        totalItems: Number(count),
        itemsPerPage: limit,
        hasNextPage: page * limit < Number(count),
        hasPrevPage: page > 1,
      },
      filters: {
        minPrice: Number(priceMin) ?? 0,
        maxPrice: Number(priceMax) ?? 0,
      },
    };
  }

  
}
