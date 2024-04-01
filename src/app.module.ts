import {JwtModule} from '@nestjs/jwt';
import {Module} from '@nestjs/common';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AppController} from './app.controller';
import {MongooseModule} from '@nestjs/mongoose';
import {MailerModule} from '@nestjs-modules/mailer';

@Module({
  imports: [
    ConfigModule.forRoot({envFilePath: '.env', isGlobal: true}),
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
    JwtModule.register({signOptions: {expiresIn: process.env.JWT_TOKEN_EXPIRES_IN}, secret: process.env.SECRET_KEY}),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
