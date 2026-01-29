import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS with environment-based configuration
  const corsOrigin = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:5174,http://localhost:3000';
  const originArray = corsOrigin.split(',').map(origin => origin.trim());
  
  console.log('🔧 CORS Configuration:');
  console.log('  CORS_ORIGIN env:', process.env.CORS_ORIGIN);
  console.log('  FRONTEND_URL env:', process.env.FRONTEND_URL);
  console.log('  Final allowed origins:', originArray);
  
  app.enableCors({
    origin: originArray,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
