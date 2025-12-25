import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  unique,
  pgEnum
} from 'drizzle-orm/pg-core';


export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    parentId: integer("parent_id").references(() => categories.id,),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqCategoryNamePerParent: unique().on(table.name, table.parentId),
  })
);


