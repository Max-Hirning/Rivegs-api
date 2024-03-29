import {DBs} from './configs/DBs';
import {Module} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {MailerModule} from '@nestjs-modules/mailer';
import {UserModule} from './modules/user/user.module';
import {AuthModule} from './modules/auth/auth.module';
import {ImageModule} from './modules/image/image.module';
import {CommonModule} from './modules/common/common.module';
import {RecipeModule} from './modules/recipe/recipe.module';
import {UserSchema} from './modules/user/schemas/user.schema';
import {RecipeTypeModule} from './modules/recipe-type/recipe-type.module';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ImageModule,
    RecipeModule,
    CommonModule,
    RecipeTypeModule,

    MailerModule.forRoot({
      transport: {
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASS
        },
        port: 465,
        secure: true,
        ignoreTLS: true,
        host: 'smtp.gmail.com',
      },
      defaults: {
        from: `"No Reply" ${process.env.EMAIL}`,
      },
    }),
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
    MongooseModule.forRoot(process.env.DB_URL, {dbName: 'Rivegs'}),
    MongooseModule.forFeature([{name: DBs.users, schema: UserSchema}]),
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
