import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DestinoService } from './destino.service';
import { Destino } from './entities/destino.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('destinos')
@ApiBearerAuth()
@Controller('destinos')
export class DestinoController {
    constructor(private readonly destinoService: DestinoService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Crear un nuevo destino' })
    @ApiBody({ type: Destino, description: 'Datos del nuevo destino' })
    @ApiResponse({ status: 201, description: 'Destino creado exitosamente.', type: Destino })
    create(@Body() createDestinoDto: Partial<Destino>) {
        return this.destinoService.create(createDestinoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los destinos' })
    @ApiResponse({ status: 200, description: 'Lista de todos los destinos registrados.', type: [Destino] })
    findAll() {
        return this.destinoService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un destino' })
    @ApiParam({ name: 'id', description: 'ID numérico del destino a actualizar' })
    @ApiBody({ type: Destino, description: 'Datos actualizados del destino' })
    @ApiResponse({ status: 200, description: 'Destino actualizado exitosamente.', type: Destino })
    update(@Param('id') id: string, @Body() updateDestinoDto: Partial<Destino>) {
        return this.destinoService.update(+id, updateDestinoDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un destino' })
    @ApiParam({ name: 'id', description: 'ID numérico del destino a eliminar' })
    @ApiResponse({ status: 200, description: 'Destino eliminado exitosamente.' })
    remove(@Param('id') id: string) {
        return this.destinoService.delete(+id);
    }
}

