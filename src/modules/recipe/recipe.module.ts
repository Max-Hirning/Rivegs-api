import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {RecipeService} from './recipe.service';
import {MongooseModule} from '@nestjs/mongoose';
import {RecipeController} from './recipe.controller';
import {UserSchema} from '../user/schemas/user.schema';

@Module({
  imports: [
    JwtModule,
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
  ],
  providers: [RecipeService],
  controllers: [RecipeController],
})
export class RecipeModule {}
