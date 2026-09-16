import { Controller, Get, Post, Body, Patch, Delete, Param } from '@nestjs/common';
import { DepartamentoService } from './departamento.service';
import { Departamento } from './entities/departamento.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('departamentos')
@Controller('departamentos')
export class DepartamentoController {
    constructor(private readonly departamentoService: DepartamentoService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo departamento' })
    create(@Body() createDepartamentoDto: Partial<Departamento>) {
        return this.departamentoService.create(createDepartamentoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los departamentos' })
    findAll() {
        return this.departamentoService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un departamento por ID' })
    findOne(@Param('id') id: string) {
        return this.departamentoService.findOne(+id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un departamento' })
    update(@Param('id') id: string, @Body() updateDepartamentoDto: Partial<Departamento>) {
        return this.departamentoService.update(+id, updateDepartamentoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un departamento' })
    remove(@Param('id') id: string) {
        return this.departamentoService.remove(+id);
    }
}
