import { Inject, Injectable } from '@nestjs/common';
import { CreateProductDto, CreateProductResponseDto, ListProductsDto } from './dto/product.dto';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from 'src/database/schema';
import { asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { DATABASE_CONNECTION } from 'src/database/database-connection';

@Injectable()
export class ProductsService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: NodePgDatabase<typeof schema>,
  ) { }

  async listProducts(data: ListProductsDto) {
    const { page, limit, search, priceMin, priceMax, categories, sortBy } =
      data;

    const searchLower = search?.toLowerCase();
    const offset = (page - 1) * limit;
    let whereCondition = sql`${schema.products.deleted} = false`;

    let orderByExpr:
      | ReturnType<typeof asc>
      | ReturnType<typeof desc>
      | undefined;

    if (search) {
      whereCondition = sql`${whereCondition} AND (
              LOWER(${schema.products.title}) LIKE ${`%${searchLower}%`} OR
              LOWER(${schema.products.description}) LIKE ${`%${searchLower}%`}
            )`;
    }

    if (categories && categories.length > 0) {
      let catIds = this.db
        .select({ id: schema.categories.id })
        .from(schema.categories)
        .where(inArray(schema.products.categoryId, categories));

      whereCondition = sql`${whereCondition} AND ${schema.products.categoryId} = ANY($<number[]>${catIds})`;
    }

    if (priceMin) {
      whereCondition = sql`${whereCondition} 
            AND ${schema.products.id} IN (SELECT ${schema.productVariants.productId} 
            FROM ${schema.productVariants} WHERE COALESCE(${schema.productVariants.offerPrice},${schema.productVariants.price}) >= ${priceMin}
            )`;
    }

    if (priceMax) {
      whereCondition = sql`${whereCondition} 
            AND ${schema.products.id} IN (SELECT ${schema.productVariants.productId} 
            FROM ${schema.productVariants} WHERE COALESCE(${schema.productVariants.offerPrice},${schema.productVariants.price}) <= ${priceMax}
            )`;
    }

    if (sortBy) {
      switch (sortBy) {
        case 'price-high':
          orderByExpr = desc(
            sql`COALESCE(${schema.productVariants.offerPrice}, ${schema.productVariants.price})`,
          );
          break;
        case 'price-low':
          orderByExpr = asc(
            sql`COALESCE(${schema.productVariants.offerPrice}, ${schema.productVariants.price})`,
          );
          break;
      }
    }

    const [{ count }] = await this.db
      .select({
        count: sql<number>`cast(count(DISTINCT ${schema.products.id}) as int)`,
      })
      .from(schema.products)
      .leftJoin(schema.productVariants, eq(schema.products.id, schema.productVariants.productId))
      .where(whereCondition);

    const totalItems = Number(count);
    const totalPages = Math.ceil(totalItems / limit);

    const baseQuery = this.db
      .select({

      })
      .from(schema.products)
      .leftJoin(schema.productVariants, eq(schema.productVariants.productId, schema.products.id))
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

  async createProduct(data: CreateProductDto): Promise<CreateProductResponseDto> {

    const [categoryCheck] = await this.db
      .select({ id: schema.categories.id })
      .from(schema.categories)
      .where(eq(schema.categories.id, data.categoryId))
      .limit(1);

    if (!categoryCheck) {
      throw new Error("Category not found");
    }

    let prodId: number;

    await this.db.transaction(async (tx) => {
      const productData = await tx
        .insert(schema.products)
        .values({
          title: data.title,
          description: data.description,
          categoryId: data.categoryId,
          featured: data.featured,
          shippingfee: data.shippingfee,
          productDetails: data.productDetails,
        })
        .returning({ id: schema.products.id });

      if (!productData[0]?.id) {
        throw new Error("Failed to create product");
      }
      prodId = productData[0].id;

      let primaryVariantId: number | null = null;

      for (const color of data.colors) {
        const colorData = await tx
          .insert(schema.productColors)
          .values({
            productId: productData[0].id,
            name: color.name,
            hexCode: color.hexCode,
          })
          .returning({ id: schema.productColors.id });

        if (!colorData[0]?.id) {
          throw new Error("Failed to create product color");
        }

        let primaryImageId: number | null = null;

        await Promise.all(
          color.images.map(async (img) => {
            const result = await tx
              .insert(schema.productColorImages)
              .values({
                colorId: colorData[0].id,
                url: img.url,
              })
              .returning({ id: schema.productColorImages.id });

            if (!result[0]?.id) {
              throw new Error("Failed to create image");
            }

            if (img.isPrimary && primaryImageId !== null) {
              throw new Error("Multiple primary images provided for a color");
            }

            if (img.isPrimary) {
              primaryImageId = result[0].id;
            }
          })
        );

        if (!primaryImageId) {
          throw new Error("Exactly one primary image is required per color");
        }

        await tx
          .update(schema.productColors)
          .set({ primaryImageId })
          .where(eq(schema.productColors.id, colorData[0].id));

        await Promise.all(
          color.variants.map(async (variant) => {
            let ofp = variant.offerPrice ? variant.offerPrice.toString() : variant.price.toString()
            const result = await tx
              .insert(schema.productVariants)
              .values({
                productId: productData[0].id,
                colorId: colorData[0].id,
                size: variant.size,
                price: variant.price.toString(),
                offerPrice: ofp,
                stock: variant.stock,
              })
              .returning({ id: schema.productVariants.id })

            if (!result[0]?.id) {
              throw new Error("Failed to create variant");
            }

            if (variant.isPrimary && primaryVariantId !== null) {
              throw new Error("Multiple primary variants provided");
            }

            if (variant.isPrimary) {
              primaryVariantId = result[0].id;
            }
          })
        );
      }

      if (!primaryVariantId) {
        throw new Error("Exactly one primary variant is required");
      }

      await tx
        .update(schema.products)
        .set({ primaryVariantId })
        .where(eq(schema.products.id, productData[0].id));
    });

    return { id: prodId! }
  }

}
