import { Module } from '@nestjs/common';
import { AdminProductsController } from './controllers/admin-products.controller';
import { ProductsService } from 'src/products/products.service';
import { DatabaseModule } from 'src/database/database.module';
import { AdminCategoriesController } from './controllers/admin-categories.controller';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [DatabaseModule,CategoriesModule],
  controllers: [AdminProductsController,AdminCategoriesController],
  providers: [ProductsService],
})
export class AdminModule {}
