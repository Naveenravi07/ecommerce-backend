import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [],
  providers: [CategoriesService],
  exports: [CategoriesService]
})
export class CategoriesModule {}
