import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { Marca } from './entities/marca.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('marcas')
@Controller('marcas')
export class MarcaController {
    constructor(private readonly marcaService: MarcaService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todas las marcas' })
    @ApiResponse({ status: 200, description: 'Lista de todas las marcas registradas.', type: [Marca] })
    findAll() {
        return this.marcaService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva marca' })
    @ApiBody({ type: Marca, description: 'Datos de la nueva marca' })
    @ApiResponse({ status: 201, description: 'Marca creada exitosamente.', type: Marca })
    create(@Body() data: Partial<Marca>) {
        return this.marcaService.create(data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una marca' })
    @ApiParam({ name: 'id', description: 'ID numérico de la marca a actualizar' })
    @ApiBody({ type: Marca, description: 'Nuevos datos para la marca' })
    @ApiResponse({ status: 200, description: 'Marca actualizada exitosamente.', type: Marca })
    update(@Param('id') id: string, @Body() data: Partial<Marca>) {
        return this.marcaService.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una marca' })
    @ApiParam({ name: 'id', description: 'ID numérico de la marca a eliminar' })
    @ApiResponse({ status: 200, description: 'Marca eliminada exitosamente.' })
    delete(@Param('id') id: string) {
        return this.marcaService.delete(+id);
    }
}

