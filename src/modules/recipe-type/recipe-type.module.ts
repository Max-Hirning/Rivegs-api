import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {Collections} from 'configs/collections';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageModule} from 'modules/image/image.module';
import {RecipeTypeService} from './recipe-type.service';
import {CommonModule} from 'modules/common/common.module';
import {RecipeTypeController} from './recipe-type.controller';
import {RecipeTypeSchema} from './schemas/recipe-type.schema';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.recipesTypes, schema: RecipeTypeSchema}]),
  ],
  providers: [RecipeTypeService],
  controllers: [RecipeTypeController],
})
export class RecipeTypeModule {}
