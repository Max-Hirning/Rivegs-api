import {AppModule} from './app.module';
import {NestFactory} from '@nestjs/core';
import {ValidationPipe} from '@nestjs/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: '*',
    methods: 'GET, PUT, POST, DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  await app.listen(process.env.PORT);
  console.log('API is running');
}

bootstrap();
