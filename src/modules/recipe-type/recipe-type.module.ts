import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageModule} from '../image/image.module';
import {CommonModule} from '../common/common.module';
import {RecipeTypeService} from './recipe-type.service';
import {RecipeTypeSchema} from './schemas/recipe-type.schema';
import {RecipeTypeController} from './recipe-type.controller';

@Module({
  imports: [
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: DBs.recipesTypes, schema: RecipeTypeSchema}]),
  ],
  providers: [RecipeTypeService],
  controllers: [RecipeTypeController],
})
export class RecipeTypeModule {}
