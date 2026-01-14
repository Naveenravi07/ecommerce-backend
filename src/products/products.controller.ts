import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import {
  GetProductParamsDto,
  GetProductResponseDto,
  ListProductsDto,
  ListProductsResponseDto,
} from './dto/product.dto';
import { ZodResponse } from 'nestjs-zod';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { apiErrorsResponseDto, apiSuccessResponseDto } from 'src/common/http/api-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @AllowAnonymous()
  @Get('/list')
  @ZodResponse({ status: 200, type: apiSuccessResponseDto(ListProductsResponseDto, 'ListProductsResponseDto'), description: 'List products with pagination and filters' })
  listProducts(@Query() data: ListProductsDto) {
    return this.productsService.listProducts(data)
  }

  @AllowAnonymous()
  @Get(':id')
  @ZodResponse({ status: 200, type: apiSuccessResponseDto(GetProductResponseDto, 'GetProductResponseDto'), description: 'Get product details by ID' })
  @ZodResponse({ status: 404, type: apiErrorsResponseDto({} as any, 'NotFoundException'), description: 'Product not found' })
  getProduct(@Param() params: GetProductParamsDto) {
    return this.productsService.getProduct(params.id);
  }
}
