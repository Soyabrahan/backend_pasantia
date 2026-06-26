import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuarioModule } from './usuario/usuario.module';
import { AuthModule } from './auth/auth.module';
import { VehiculoModule } from './vehiculo/vehiculo.module';
import { DestinoModule } from './destino/destino.module';
import { EquipoModule } from './equipo/equipo.module';
import { PaseModule } from './pase/pase.module';
import { EmpleadoModule } from './empleado/empleado.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `env/.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DB_PATH', 'database_test.sqlite'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    UsuarioModule,
    AuthModule,
    VehiculoModule,
    DestinoModule,
    EquipoModule,
    PaseModule,
    EmpleadoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
