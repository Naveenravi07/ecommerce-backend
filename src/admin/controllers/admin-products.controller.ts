import { Body, Controller, NotImplementedException, Post } from '@nestjs/common';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto } from 'src/products/dto/product.dto';

@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

    @Post('new')
    createProduct(@Body() data: CreateProductDto) {
        throw new NotImplementedException('Not implemented');
    }

}
