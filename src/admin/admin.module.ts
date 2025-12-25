import { Module } from '@nestjs/common';
import { AdminProductsController } from './controllers/admin-products.controller';
import { ProductsService } from 'src/products/products.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AdminProductsController],
  providers: [ProductsService],
})
export class AdminModule {}
