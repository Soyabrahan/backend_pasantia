import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VehiculoService } from './vehiculo.service';
import { Vehiculo } from './entities/vehiculo.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('vehiculos')
@ApiBearerAuth()
@Controller('vehiculos')
export class VehiculoController {
    constructor(private readonly vehiculoService: VehiculoService) { }

    @UseGuards(AuthGuard('jwt'))
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

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un vehículo' })
    update(@Param('id') id: string, @Body() vehiculo: Partial<Vehiculo>) {
        return this.vehiculoService.update(+id, vehiculo);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un vehículo' })
    delete(@Param('id') id: string) {
        return this.vehiculoService.delete(+id);
    }
}
