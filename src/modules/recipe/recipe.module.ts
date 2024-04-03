import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {RecipeService} from './recipe.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from 'configs/collections';
import {RecipeSchema} from './schemas/recipe.schema';
import {RecipeController} from './recipe.controller';
import {ImageModule} from 'modules/image/image.module';
import {CommonModule} from 'modules/common/common.module';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.recipes, schema: RecipeSchema}]),
  ],
  exports: [RecipeService],
  providers: [RecipeService],
  controllers: [RecipeController],
})
export class RecipeModule {}
