import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {CommonModule} from '../common/common.module';

@Module({
  imports: [
    JwtModule,
    CommonModule,
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
