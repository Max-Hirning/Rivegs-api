import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserController} from './user.controller';
import {UserSchema} from './schemas/user.schema';
import {Collections} from '../../configs/collections';
import {ImageModule} from '../../modules/image/image.module';
import {CommonModule} from '../../modules/common/common.module';
import {RecipeModule} from '../../modules/recipe/recipe.module';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    RecipeModule,
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
