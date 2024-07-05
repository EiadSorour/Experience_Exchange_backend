import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './utils/app.ExceptionFilter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AppExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({whitelist:true}))
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
