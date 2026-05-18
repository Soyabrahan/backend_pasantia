import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuracion de Swagger
  const config = new DocumentBuilder()
    .setTitle('Proyecto Pasantia API')
    .setDescription(
      'Documentación de la API para el sistema de pases de la pasantía.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 1. Configuración de CORS más robusta
  app.enableCors({
    origin: [
      'http://10.200.23.71',         // IP de la red de Ferrominera
      'http://serverlaptop.local',
      'http://serverlaptop',
      'http://localhost:3000',
      'http://192.168.1.7',          // IP directa
      'http://192.168.1.7:3000',     // IP para pruebas sin Nginx
      'app://-',                     // Para aplicación Electron empaquetada
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,X-Requested-With',
    credentials: true,
  });

  // 2. Escuchar en 0.0.0.0 es la clave para la red de Ferrominera
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Backend corriendo en: http://192.168.1.7:${port}`);
  console.log(`Documentación disponible en: http://192.168.1.7:${port}/docs`);
}
bootstrap();
