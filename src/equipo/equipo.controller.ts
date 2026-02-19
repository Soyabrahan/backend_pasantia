import { Controller, Get, Post, Body } from '@nestjs/common';
import { EquipoService } from './equipo.service';
import { Equipo } from './entities/equipo.entity';

@Controller('equipos')
export class EquipoController {
    constructor(private readonly equipoService: EquipoService) { }

    @Post()
    create(@Body() createEquipoDto: Partial<Equipo>) {
        return this.equipoService.create(createEquipoDto);
    }

    @Get()
    findAll() {
        return this.equipoService.findAll();
    }
}
