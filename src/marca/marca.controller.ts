import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { MarcaService } from './marca.service';
import { Marca } from './entities/marca.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('marcas')
@Controller('marcas')
export class MarcaController {
    constructor(private readonly marcaService: MarcaService) {}

    @Get()
    @ApiOperation({ summary: 'Obtener todas las marcas' })
    findAll() {
        return this.marcaService.findAll();
    }

    @Post()
    @ApiOperation({ summary: 'Crear una nueva marca' })
    create(@Body() data: Partial<Marca>) {
        return this.marcaService.create(data);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una marca' })
    update(@Param('id') id: string, @Body() data: Partial<Marca>) {
        return this.marcaService.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una marca' })
    delete(@Param('id') id: string) {
        return this.marcaService.delete(+id);
    }
}
