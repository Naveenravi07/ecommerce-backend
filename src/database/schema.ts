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
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// CATEGORIES
// ============================================================================

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    parentId: integer("parent_id").references((): any => categories.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("categories_name_unique").on(table.name),
  ]
);

// ============================================================================
// PRODUCTS
// ============================================================================

export const sizeEnum = pgEnum("size_enum", [
  "XS", "S", "M", "L", "XL", "XXL", "XXXL",
]);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id)
    .notNull(),
  featured: boolean('featured').default(false).notNull(),
  shippingfee: integer('shipping_fee').notNull().default(0),
  deleted: boolean('deleted').default(false).notNull(),
  primaryVariantId: integer("primary_variant_id")
    .references((): any => productVariants.id),
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
  primaryImageId: integer("primary_image_id")
    .references((): any => productColorImages.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productColorImages = pgTable("product_color_images", {
  id: serial("id").primaryKey(),
  colorId: integer("color_id")
    .references(() => productColors.id)
    .notNull(),
  url: text("url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    colorId: integer("color_id")
      .references(() => productColors.id),
    size: sizeEnum("size"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    offerPrice: decimal("offer_price", { precision: 10, scale: 2 }),
    stock: integer("stock").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique().on(table.productId, table.colorId, table.size),
  ]
);

// ============================================================================
// AUTH
// ============================================================================

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)]
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)]
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)]
);

// ============================================================================
// RELATIONS (Optional but recommended)
// ============================================================================

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));