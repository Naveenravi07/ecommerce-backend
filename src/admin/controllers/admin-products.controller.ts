import { Body, Controller, Post } from '@nestjs/common';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto, CreateProductResponseDto } from 'src/products/dto/product.dto';
import { ZodResponse } from 'nestjs-zod';
import { apiSuccessResponseDto } from 'src/common/http/api-response.dto';


@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('new')
  @ZodResponse({ status: 201, type: apiSuccessResponseDto(CreateProductResponseDto,'CreateProductResponseDto'), description: 'Creates a new product' })
  async createProduct(@Body() data: CreateProductDto) {
    let response = await this.productsService.createProduct(data);
    return response
  }

}
