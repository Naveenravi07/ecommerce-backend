import {
  pgTable,
  serial,
  varchar,
  boolean,
  integer,
  timestamp,
  unique,
  jsonb,
  text,
  decimal,
  pgEnum
} from 'drizzle-orm/pg-core';
import { categories } from 'src/categories/schema';

export const sizeEnum = pgEnum("size_enum", [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
]);



export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  featured: boolean('featured').default(false).notNull(),
  shippingfee: integer('shipping_fee').notNull().default(0),
  deleted: boolean('deleted').default(false).notNull(),
  primaryVariantId: integer("primary_variant_id").references(() => productVariants.id),
  productDetails: jsonb('product_details')
    .$type<{ [key: string]: string }>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const productColors = pgTable("product_colors", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .references(() => products.id)
    .notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  hexCode: varchar("hex_code", { length: 7 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productColorImages = pgTable("product_color_images", {
  id: serial("id").primaryKey(),
  colorId: integer("color_id")
    .references(() => productColors.id)
    .notNull(),
  url: text("url").notNull(),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    colorId: integer("color_id").references(() => productColors.id),
    size: sizeEnum("size"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    offerPrice: decimal("offer_price", { precision: 10, scale: 2 }),
    stock: integer("stock").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqVariant: unique().on(table.productId, table.colorId, table.size),
  }),
);
