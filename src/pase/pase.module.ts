import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaseService } from './pase.service';
import { PaseController } from './pase.controller';
import { Pase } from './entities/pase.entity';
import { EquiposPases } from './entities/equipos-pases.entity';
import { EquipoModule } from '../equipo/equipo.module';
import { Equipo } from '../equipo/entities/equipo.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { VehiculoModule } from '../vehiculo/vehiculo.module';
import { DestinoModule } from '../destino/destino.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Pase, EquiposPases, Equipo]),
        EquipoModule,
        UsuarioModule,
        VehiculoModule,
        DestinoModule,
    ],
    controllers: [PaseController],
    providers: [PaseService],
})
export class PaseModule { }
