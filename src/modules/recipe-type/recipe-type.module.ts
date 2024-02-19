import {Module} from '@nestjs/common';
import {RecipeTypeService} from './recipe-type.service';
import {RecipeTypeController} from './recipe-type.controller';

@Module({
  providers: [RecipeTypeService],
  controllers: [RecipeTypeController],
})
export class RecipeTypeModule {}
