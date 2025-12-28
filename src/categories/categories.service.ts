import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DATABASE_CONNECTION } from 'src/database/database-connection';
import * as schema from 'src/database/schema'; // Import as namespace
import { CreateCategoryDto, CreateCategoryResponseDto } from './dto/categories.dto';
import { eq } from 'drizzle-orm';

@Injectable()
export class CategoriesService {
    
    constructor(
        @Inject(DATABASE_CONNECTION)
        private readonly db: NodePgDatabase<typeof schema>,
    ) {}
    
    async createCategory(data: CreateCategoryDto): Promise<CreateCategoryResponseDto> {
        const existingCategory = await this.db
            .select()
            .from(schema.categories)
            .where(eq(schema.categories.name, data.name)) 
            .limit(1);
        
        if (existingCategory.length > 0) {
            throw new BadRequestException('Category with the same name already exists');
        }
        
        const result = await this.db
            .insert(schema.categories)
            .values({
                name: data.name,
                parentId: data.parentId || null,
            })
            .returning();
        
        return result[0]
    }
}