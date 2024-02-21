import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {ImageModule} from '../image/image.module';
import {CommonModule} from '../common/common.module';
import {RecipeModule} from '../recipe/recipe.module';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    RecipeModule,
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
