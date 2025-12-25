import { Controller, Post } from '@nestjs/common';
import { ProductsService } from '../../products/products.service';

@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

    @Post('new')
    createProduct() {
        
    }

}
