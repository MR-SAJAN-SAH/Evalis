import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix FIRST
  app.setGlobalPrefix('api');
  
  // ========== CORS CONFIGURATION ==========
  // Build list of allowed origins
  const allowedOrigins: string[] = [
    // Development
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    // Production Render
    'https://evalis-frontend.onrender.com',
    // Allow environment variable to override/extend
    ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ];

  // Remove duplicates
  const uniqueOrigins = Array.from(new Set(allowedOrigins)).filter(Boolean);
  
  console.log('🔧 CORS Configuration:');
  console.log('  NODE_ENV:', process.env.NODE_ENV);
  console.log('  Allowed origins:', uniqueOrigins);
  
  // Apply CORS
  app.enableCors({
    origin: (requestOrigin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!requestOrigin) {
        return callback(null, true);
      }
      
      if (uniqueOrigins.includes(requestOrigin)) {
        callback(null, true);
      } else {
        console.warn(`  ⚠️ CORS rejected origin: ${requestOrigin}`);
        callback(new Error('Not allowed by CORS policy'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200,
    preflightContinue: false,
    maxAge: 86400, // 24 hours
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
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();
