import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS – comma-separated list of allowed origins in FRONTEND_URL
  const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:5173';
  const origins = rawOrigins.split(',').map(s => s.trim()).filter(Boolean);
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow same-origin / non-browser requests
      if (!origin) return callback(null, true);
      
      // Allow configured origins
      if (origins.includes(origin)) return callback(null, true);
      
      // In development, allow localhost
      if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
        return callback(null, true);
      }
      
      // Allow vercel deployments in production
      if (origin.includes('vercel.app')) return callback(null, true);
      
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger / API docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevToolkit API')
    .setDescription('API for DevToolkit – auth, history, API keys, and network tools')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = parseInt(process.env.PORT || '3001', 10);
  await app.listen(port);
  console.log(`🚀 DevToolkit backend running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
