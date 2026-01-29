import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix FIRST
  app.setGlobalPrefix('api');
  
  // Enable CORS with environment-based configuration
  // Support both CORS_ORIGIN and FRONTEND_URL env vars
  const corsOriginEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '';
  const defaultOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'];
  
  // Parse origins from environment variable
  let originArray: string[] = [];
  if (corsOriginEnv) {
    originArray = corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean);
  }
  // Add defaults if no env var is set
  if (originArray.length === 0) {
    originArray = defaultOrigins;
  }
  
  console.log('🔧 CORS Configuration:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  CORS_ORIGIN env:', process.env.CORS_ORIGIN);
  console.log('  FRONTEND_URL env:', process.env.FRONTEND_URL);
  console.log('  Final allowed origins:', originArray);
  
  // Create a function-based origin matcher for better debugging
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log('  [CORS] Checking origin:', origin);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        console.log('  [CORS] No origin header, allowing');
        return callback(null, true);
      }
      
      // Check if origin is in allowed list
      if (originArray.includes(origin)) {
        console.log('  [CORS] Origin allowed:', origin);
        callback(null, true);
      } else {
        console.log('  [CORS] Origin NOT allowed:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
  });

  // Add global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );
  
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}
bootstrap();
