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

import { asc, desc, eq, sql } from 'drizzle-orm';
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

    let orderByExpr:
      | ReturnType<typeof asc>
      | ReturnType<typeof desc>
      | undefined;

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
          orderByExpr = desc(
            sql`COALESCE(${productVariants.offerPrice}, ${productVariants.price})`,
          );
          break;
        case 'price-low':
          orderByExpr = asc(
            sql`COALESCE(${productVariants.offerPrice}, ${productVariants.price})`,
          );
          break;
      }
    }

    const [{ count }] = await this.db
      .select({
        count: sql<number>`cast(count(DISTINCT ${products.id}) as int)`,
      })
      .from(products)
      .leftJoin(productVariants, eq(products.id, productVariants.productId))
      .where(whereCondition);

    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limit);

    const baseQuery = this.db
      .select()
      .from(products)
      .leftJoin(productVariants, eq(productVariants.productId, products.id))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    const result = await (orderByExpr ? baseQuery.orderBy(orderByExpr) : baseQuery);
     
    return {
      items: result,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasNextPage: page * limit < totalItems,
        hasPrevPage: page > 1,
      },
      filters: {
        search: search ?? null,
        categories: categories ?? null,
        priceMin: priceMin ?? null,
        priceMax: priceMax ?? null,
        sortBy: sortBy ?? null,
      },
    };
  }
  
  async createProduct(){
    
  }
}
