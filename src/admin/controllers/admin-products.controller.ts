import { Body, Controller, Post } from '@nestjs/common';
import { ProductsService } from '../../products/products.service';
import { CreateProductDto, CreateProductResponseDto } from 'src/products/dto/product.dto';
import { ZodResponse } from 'nestjs-zod';
import { apiSuccessResponseDto,apiErrorsResponseDto } from 'src/common/http/api-response.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin/products')
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post('new')
  @ZodResponse({ status: 201, type: apiSuccessResponseDto(CreateProductResponseDto,'CreateProductResponseDto'), description: 'Creates a new product' })
  @ZodResponse({ status: 400, type: apiErrorsResponseDto({} as any,'BadRequestException'), description: 'Bad Request' })
  @ZodResponse({ status: 404, type: apiErrorsResponseDto({} as any,'NotFoundException'), description: 'Not found' })
  async createProduct(@Body() data: CreateProductDto) {
    let response = await this.productsService.createProduct(data);
    return response
  }

}
