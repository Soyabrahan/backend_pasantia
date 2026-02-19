import { Controller, Get, Post, Body } from '@nestjs/common';
import { VehiculoService } from './vehiculo.service';
import { Vehiculo } from './entities/vehiculo.entity';

@Controller('vehiculos')
export class VehiculoController {
    constructor(private readonly vehiculoService: VehiculoService) { }

    @Post()
    create(@Body() createVehiculoDto: Partial<Vehiculo>) {
        return this.vehiculoService.create(createVehiculoDto);
    }

    @Get()
    findAll() {
        return this.vehiculoService.findAll();
    }
}
