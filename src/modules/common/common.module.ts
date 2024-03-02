import {Module} from '@nestjs/common';
import {DBs} from '../../configs/DBs';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule} from '@nestjs/config';
import {CommonService} from './common.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from '../user/schemas/user.schema';
import {RecipeSchema} from '../recipe/schemas/recipe.schema';
import {RecipeTypeSchema} from '../recipe-type/schemas/recipe-type.schema';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
    MongooseModule.forFeature([{name: DBs.recipes, schema: RecipeSchema}]),
    MongooseModule.forFeature([{name: DBs.recipesTypes, schema: RecipeTypeSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  exports: [CommonService],
  providers: [CommonService],
})
export class CommonModule {}
