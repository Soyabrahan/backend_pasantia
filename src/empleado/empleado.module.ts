import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpleadoService } from './empleado.service';
import { EmpleadoController } from './empleado.controller';
import { Empleado } from './entities/empleado.entity';
import { DepartamentoModule } from '../departamento/departamento.module';

@Module({
    imports: [TypeOrmModule.forFeature([Empleado]), DepartamentoModule],
    controllers: [EmpleadoController],
    providers: [EmpleadoService],
    exports: [EmpleadoService],
})
export class EmpleadoModule { }
