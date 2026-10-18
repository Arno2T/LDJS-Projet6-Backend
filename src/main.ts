import { readFileSync } from 'fs';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { MongooseExceptionFilter } from '@core/filters/mongoose-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const { version } = JSON.parse(
    readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
  ) as { version: string};

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new MongooseExceptionFilter());

  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:5173'),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Workshop Organizer API')
    .setDescription('API for managing workshops and educational notions')
    .setVersion(version)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(`Server running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/api/docs`);
}

bootstrap();
