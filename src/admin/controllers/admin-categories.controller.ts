import { Body, Controller, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { apiSuccessResponseDto } from 'src/common/http/api-response.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateCategoryDto, CreateCategoryResponseDto } from 'src/categories/dto/categories.dto';

@Controller('admin/categories')
export class AdminCategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post('new')
    @ZodResponse({ status: 201, type: apiSuccessResponseDto(CreateCategoryResponseDto,'CreateCategoryResponseDto'), description: 'Creates a new category' })
    createCategory(@Body() data: CreateCategoryDto) {
        let response = this.categoriesService.createCategory(data);
        return response;
    }

}
