import { Body, Controller, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { apiErrorsResponseDto, apiSuccessResponseDto } from 'src/common/http/api-response.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { CreateCategoryDto, CreateCategoryResponseDto } from 'src/categories/dto/categories.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Admin')
@Controller('admin/categories')
export class AdminCategoriesController {
    constructor(private readonly categoriesService: CategoriesService) { }

    @Post('new')
    @ZodResponse({ status: 201, type: apiSuccessResponseDto(CreateCategoryResponseDto,'CreateCategoryResponseDto'), description: 'Creates a new category' })
    @ZodResponse({ status: 400, type: apiErrorsResponseDto({} as any,'BadRequestException'), description: 'Bad Request' })
    createCategory(@Body() data: CreateCategoryDto) {
        let response = this.categoriesService.createCategory(data);
        return response;
    }

}
