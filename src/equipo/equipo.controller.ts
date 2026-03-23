import { Controller, Get, Post, Body } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { Equipo } from './entities/equipo.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('equipos')
@Controller('equipos')
export class EquipoController {
    constructor(private readonly equipoService: EquipoService) { }

    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo equipo o herramienta' })
    create(@Body() createEquipoDto: Partial<Equipo>) {
        return this.equipoService.create(createEquipoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los equipos registrados' })
    findAll() {
        return this.equipoService.findAll();
    }
}
