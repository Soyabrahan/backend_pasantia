import { Controller, Get, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { VehiculoService } from './vehiculo.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('vehiculos')
@Controller('vehiculos')
export class VehiculoController {
    constructor(private readonly vehiculoService: VehiculoService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo vehículo' })
    create(@Body() createVehiculoDto: Partial<Vehiculo>) {
        return this.vehiculoService.create(createVehiculoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los vehículos registrados' })
    findAll() {
        return this.vehiculoService.findAll();
    }
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un vehículo' })
    update(@Param('id') id: string, @Body() vehiculo: Partial<Vehiculo>) {
        return this.vehiculoService.update(+id, vehiculo);
    }
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un vehículo' })
    delete(@Param('id') id: string) {
        return this.vehiculoService.delete(+id);
    }
}
