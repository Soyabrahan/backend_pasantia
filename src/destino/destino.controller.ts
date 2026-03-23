import { Controller, Get, Post, Body } from '@nestjs/common';
import { DestinoService } from './destino.service';
import { Destino } from './entities/destino.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('destinos')
@Controller('destinos')
export class DestinoController {
    constructor(private readonly destinoService: DestinoService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo destino' })
    create(@Body() createDestinoDto: Partial<Destino>) {
        return this.destinoService.create(createDestinoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los destinos' })
    findAll() {
        return this.destinoService.findAll();
    }
}
