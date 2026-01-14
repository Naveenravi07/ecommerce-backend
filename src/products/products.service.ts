import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateProductDto,
  CreateProductResponseDto,
  GetProductResponseDto,
  ListProductsDto,
  ListProductsResponseDto,
} from './dto/product.dto';
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

  async listProducts(data: ListProductsDto): Promise<ListProductsResponseDto> {
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
        id: schema.products.id,
        title: schema.products.title,
        description: schema.products.description,
        shippingfee: schema.products.shippingfee,
        featured: schema.products.featured,
        createdAt: schema.products.createdAt,
        updatedAt: schema.products.updatedAt,
        categoryId: schema.categories.id,
        categoryName: schema.categories.name,
        price: schema.productVariants.price,
        offerPrice: schema.productVariants.offerPrice,
        stock: schema.productVariants.stock,
        primaryImageId: schema.productColors.primaryImageId,
      })
      .from(schema.products)
      .leftJoin(schema.productVariants, eq(schema.productVariants.id, schema.products.primaryVariantId))
      .leftJoin(schema.productColors, eq(schema.productColors.id, schema.productVariants.colorId))
      .leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    const rawResult = await (orderByExpr ? baseQuery.orderBy(orderByExpr) : baseQuery);

    const productIds = rawResult.map((p) => p.id);
    
    const images = productIds.length > 0
      ? await this.db
          .select({
            productId: schema.productColors.productId,
            imageId: schema.productColorImages.id,
            url: schema.productColorImages.url,
          })
          .from(schema.productColorImages)
          .innerJoin(schema.productColors, eq(schema.productColors.id, schema.productColorImages.colorId))
          .where(inArray(schema.productColors.productId, productIds))
      : [];

    const imagesByProduct = images.reduce((acc, img) => {
      if (!acc[img.productId]) acc[img.productId] = [];
      acc[img.productId].push({ id: img.imageId, url: img.url });
      return acc;
    }, {} as Record<number, { id: number; url: string }[]>);

    const items = rawResult.map((product) => ({
      id: product.id,
      title: product.title,
      description:
        product.description.length > 100
          ? product.description.substring(0, 100) + '...'
          : product.description,
      price: product.price ? parseFloat(product.price) : 0,
      shippingfee: product.shippingfee,
      category: { id: product.categoryId, name: product.categoryName },
      featured: product.featured,
      stock: product.stock,
      images: imagesByProduct[product.id] ?? [],
      primaryImageId: product.primaryImageId,
      offerPrice: product.offerPrice ? parseFloat(product.offerPrice) : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return {
      items,
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
      .limit(1)

    if (!categoryCheck) {
      throw new NotFoundException('Category not found');
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
        throw new BadRequestException('Failed to create product');
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
          throw new BadRequestException('Failed to create product color');
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
              throw new BadRequestException('Failed to create image');
            }

            if (img.isPrimary && primaryImageId !== null) {
              throw new BadRequestException("Multiple primary images provided for a color");
            }

            if (img.isPrimary) {
              primaryImageId = result[0].id;
            }
          })
        );

        if (!primaryImageId) {
          throw new BadRequestException("Exactly one primary image is required per color");
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
              throw new BadRequestException("Failed to create variant");
            }

            if (variant.isPrimary && primaryVariantId !== null) {
              throw new BadRequestException("Multiple primary variants provided");
            }

            if (variant.isPrimary) {
              primaryVariantId = result[0].id;
            }
          })
        );
      }

      if (!primaryVariantId) {
        throw new BadRequestException("Exactly one primary variant is required");
      }

      await tx
        .update(schema.products)
        .set({ primaryVariantId })
        .where(eq(schema.products.id, productData[0].id));
    });

    return { id: prodId! }
  }

  async getProduct(id: number): Promise<GetProductResponseDto> {
    const [product] = await this.db
      .select({
        id: schema.products.id,
        title: schema.products.title,
        description: schema.products.description,
        shippingfee: schema.products.shippingfee,
        featured: schema.products.featured,
        productDetails: schema.products.productDetails,
        primaryVariantId: schema.products.primaryVariantId,
        createdAt: schema.products.createdAt,
        updatedAt: schema.products.updatedAt,
        categoryId: schema.categories.id,
        categoryName: schema.categories.name,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.categories.id, schema.products.categoryId))
      .where(sql`${schema.products.id} = ${id} AND ${schema.products.deleted} = false`)
      .limit(1);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const colors = await this.db
      .select({
        id: schema.productColors.id,
        name: schema.productColors.name,
        hexCode: schema.productColors.hexCode,
        primaryImageId: schema.productColors.primaryImageId,
      })
      .from(schema.productColors)
      .where(eq(schema.productColors.productId, id));

    const colorIds = colors.map((c) => c.id);

    let images: { id: number; colorId: number; url: string }[] = [];
    let variants: { id: number; colorId: number | null; size: "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL" | null; price: string; offerPrice: string | null; stock: number }[] = [];

    if (colorIds.length > 0) {
      [images, variants] = await Promise.all([
        this.db
          .select({
            id: schema.productColorImages.id,
            colorId: schema.productColorImages.colorId,
            url: schema.productColorImages.url,
          })
          .from(schema.productColorImages)
          .where(inArray(schema.productColorImages.colorId, colorIds)),
        this.db
          .select({
            id: schema.productVariants.id,
            colorId: schema.productVariants.colorId,
            size: schema.productVariants.size,
            price: schema.productVariants.price,
            offerPrice: schema.productVariants.offerPrice,
            stock: schema.productVariants.stock,
          })
          .from(schema.productVariants)
          .where(inArray(schema.productVariants.colorId, colorIds)),
      ]);
    }

    const imagesByColor = images.reduce(
      (acc, img) => {
        if (!acc[img.colorId]) acc[img.colorId] = [];
        acc[img.colorId].push({ id: img.id, url: img.url });
        return acc;
      },
      {} as Record<number, { id: number; url: string }[]>,
    );

    type SizeEnum = "XS" | "S" | "M" | "L" | "XL" | "XXL" | "XXXL";

    const variantsByColor = variants.reduce(
      (acc, v) => {
        if (!v.colorId) return acc;
        if (!acc[v.colorId]) acc[v.colorId] = [];
        acc[v.colorId].push({
          id: v.id,
          size: v.size as SizeEnum,
          price: parseFloat(v.price),
          offerPrice: v.offerPrice ? parseFloat(v.offerPrice) : null,
          stock: v.stock,
        });
        return acc;
      },
      {} as Record<number, { id: number; size: SizeEnum; price: number; offerPrice: number | null; stock: number }[]>,
    );

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      shippingfee: product.shippingfee,
      featured: product.featured,
      productDetails: product.productDetails,
      category: { id: product.categoryId, name: product.categoryName },
      primaryVariantId: product.primaryVariantId,
      colors: colors.map((color) => ({
        id: color.id,
        name: color.name,
        hexCode: color.hexCode,
        primaryImageId: color.primaryImageId,
        images: imagesByColor[color.id] ?? [],
        variants: variantsByColor[color.id] ?? [],
      })),
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
