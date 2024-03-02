import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {RecipeService} from './recipe.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ImageModule} from '../image/image.module';
import {CommonModule} from '../common/common.module';
import {RecipeController} from './recipe.controller';
import {RecipeSchema} from './schemas/recipe.schema';
import {UserSchema} from '../user/schemas/user.schema';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
    MongooseModule.forFeature([{name: DBs.recipes, schema: RecipeSchema}]),
  ],
  exports: [RecipeService],
  providers: [RecipeService],
  controllers: [RecipeController],
})
export class RecipeModule {}
