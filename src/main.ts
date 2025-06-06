import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppExceptionFilter } from './utils/app.ExceptionFilter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ensureDatabaseExists } from './utils/database.check';
// import * as fs from 'fs';


async function bootstrap() {

  // const httpsOptions = {
  //   key: fs.readFileSync('./src/cert/cert.key'),
  //   cert: fs.readFileSync('./src/cert/cert.crt'),
  // };

  // const app = await NestFactory.create(AppModule, { httpsOptions });


  await ensureDatabaseExists();
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new AppExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({whitelist:true}));
  app.use(cookieParser());
  app.enableCors({
      origin: 'https://experienceexchangefrontend-production.up.railway.app',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Authorization',
  });

  const config = new DocumentBuilder()
  .setTitle('Experience Exchange App')
  .setDescription('Experience exchange app API description')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  
  const port = process.env.PORT || 3001;
  await app.listen(process.env.PORT || 3001);
  console.log(`Nest.js running on port ${port}`);
  
}
bootstrap();
