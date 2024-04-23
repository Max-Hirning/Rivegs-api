import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import {RecipeTypeService} from './recipe-type.service';
import {ImageModule} from '../../modules/image/image.module';
import {RecipeTypeController} from './recipe-type.controller';
import {RecipeTypeSchema} from './schemas/recipe-type.schema';
import {RecipeModule} from '../../modules/recipe/recipe.module';
import {CommonModule} from '../../modules/common/common.module';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    RecipeModule,
    MongooseModule.forFeature([{name: Collections.recipesTypes, schema: RecipeTypeSchema}]),
  ],
  providers: [RecipeTypeService],
  controllers: [RecipeTypeController],
})
export class RecipeTypeModule {}
