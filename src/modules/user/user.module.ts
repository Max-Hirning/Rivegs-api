import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {MongooseModule} from '@nestjs/mongoose';
import {UserSchema} from './schemas/user.schema';
import {UserController} from './user.controller';
import {CommonModule} from '../common/common.module';

@Module({
  imports: [
    CommonModule,
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
