import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculoService } from './vehiculo.service';
import { VehiculoController } from './vehiculo.controller';
import { Vehiculo } from './entities/vehiculo.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Vehiculo])],
    controllers: [VehiculoController],
    providers: [VehiculoService],
})
export class VehiculoModule { }
