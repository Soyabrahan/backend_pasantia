import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de CORS más robusta
  app.enableCors({
    origin: '*', // En desarrollo, esto permite que cualquier IP (como tu cel) se conecte
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. Escuchar en 0.0.0.0 es la clave para la red de Ferrominera
  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0'); 
  
  console.log(`Backend corriendo en: http://10.200.23.71:${port}`);
}
bootstrap();