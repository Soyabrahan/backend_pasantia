import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EquipoService } from './equipo.service';
import { Equipo } from './entities/equipo.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('equipos')
@ApiBearerAuth()
@Controller('equipos')
export class EquipoController {
    constructor(private readonly equipoService: EquipoService) { }

    @UseGuards(AuthGuard('jwt'))
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
