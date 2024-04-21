import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {AppService} from 'app.service';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {Collections} from 'configs/collections';
import {MailerModule} from '@nestjs-modules/mailer';
import {AuthModule} from './modules/auth/auth.module';
import {UserModule} from './modules/user/user.module';
import {UserSchema} from 'modules/user/schemas/user.schema';
import {RecipeModule} from './modules/recipe/recipe.module';
import {CommonModule} from './modules/common/common.module';
import {RecipeTypeModule} from './modules/recipe-type/recipe-type.module';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    AuthModule,
    UserModule,
    CommonModule,
    RecipeModule,
    RecipeTypeModule,
    MailerModule.forRoot({
      transport: {
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS,
        },
        port: 465, 
        secure: true,
        ignoreTLS: true,
        host: 'smtp.gmail.com',
      },
      defaults: {
        sender: process.env.EMAIL,
        replyTo: process.env.EMAIL,
        from: `"No Reply" ${process.env.EMAIL}`,
      },
    }),
    MongooseModule.forRoot(process.env.DB_URL, {dbName: 'Rivegs'}),
    MongooseModule.forFeature([{name: Collections.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
