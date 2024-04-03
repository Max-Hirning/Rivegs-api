import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from 'configs/collections';
import {UserController} from './user.controller';
import {UserSchema} from './schemas/user.schema';
import {ImageModule} from 'modules/image/image.module';
import {CommonModule} from 'modules/common/common.module';

@Module({
  imports: [
    JwtModule,
    ImageModule,
    CommonModule,
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
