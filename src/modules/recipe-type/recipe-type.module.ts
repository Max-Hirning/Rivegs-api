import {Module} from '@nestjs/common';
import {DBs} from '../../configs/DBs';
import {JwtModule} from '@nestjs/jwt';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageModule} from '../image/image.module';
import {CommonModule} from '../common/common.module';
import {RecipeModule} from '../recipe/recipe.module';
import {RecipeTypeService} from './recipe-type.service';
import {RecipeTypeSchema} from './schemas/recipe-type.schema';
import {RecipeTypeController} from './recipe-type.controller';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    RecipeModule,
    MongooseModule.forFeature([{name: DBs.recipesTypes, schema: RecipeTypeSchema}]),
  ],
  providers: [RecipeTypeService],
  controllers: [RecipeTypeController],
})
export class RecipeTypeModule {}
