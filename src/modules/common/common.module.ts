import {Module} from '@nestjs/common';
import {CommonService} from './common.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from '../../configs/collections';
import {UserSchema} from '../user/schemas/user.schema';
import {ImageSchema} from '../image/schemas/image.schema';
import {RecipeSchema} from '../recipe/schemas/recipe.schema';
import {RecipeTypeSchema} from '../recipe-type/schemas/recipe-type.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    MongooseModule.forFeature([{name: Collections.images, schema: ImageSchema}]),
    MongooseModule.forFeature([{name: Collections.recipes, schema: RecipeSchema}]),
    MongooseModule.forFeature([{name: Collections.recipesTypes, schema: RecipeTypeSchema}]),
  ],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
