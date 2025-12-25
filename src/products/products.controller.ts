import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ListProductsDto } from './dto/product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @Get('/list')
  listProducts(@Query() data: ListProductsDto) {
    return this.productsService.listProducts(data);
  }

}
