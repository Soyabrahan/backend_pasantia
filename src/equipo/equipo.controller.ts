import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EquipoService } from './equipo.service';
import { Equipo } from './entities/equipo.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('equipos')
@ApiBearerAuth()
@Controller('equipos')
export class EquipoController {
    constructor(private readonly equipoService: EquipoService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo equipo o herramienta' })
    @ApiBody({ type: Equipo, description: 'Datos del nuevo equipo' })
    @ApiResponse({ status: 201, description: 'Equipo creado exitosamente.', type: Equipo })
    create(@Body() createEquipoDto: Partial<Equipo>) {
        return this.equipoService.create(createEquipoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los equipos registrados' })
    @ApiResponse({ status: 200, description: 'Lista de todos los equipos registrados.', type: [Equipo] })
    findAll() {
        return this.equipoService.findAll();
    }
}

