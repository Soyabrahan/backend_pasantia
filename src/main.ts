import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuracion de Swagger
  const config = new DocumentBuilder()
    .setTitle('Proyecto Pasantia API')
    .setDescription('Documentación de la API para el sistema de pases de la pasantía.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // 1. Configuración de CORS más robusta
  app.enableCors({
    origin: [
      'http://serverlaptop.local',   // Permite el nombre de red
      'http://serverlaptop',         // Permite el nombre corto
      'http://localhost:3000',       // Permite desarrollo local
      'http://192.168.1.121',       // Tu IP actual por si acaso
    ], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Escuchar en 0.0.0.0 es la clave para la red de Ferrominera
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Backend corriendo en: http://192.168.1.10:${port}`);
  console.log(`Documentación disponible en: http://192.168.1.10:${port}/docs (interna) o http://serverlaptop.local/api/docs (vía proxy)`);
}
bootstrap();