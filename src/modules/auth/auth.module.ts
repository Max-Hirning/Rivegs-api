import {DBs} from 'src/configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AuthService} from './auth.service';
import {ConfigModule} from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import {AuthController} from './auth.controller';
import {CommonModule} from '../common/common.module';
import {UserSchema} from '../user/schemas/user.schema';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
