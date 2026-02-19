import { Controller, Get, Post, Body } from '@nestjs/common';
import { DestinoService } from './destino.service';
import { Destino } from './entities/destino.entity';

@Controller('destinos')
export class DestinoController {
    constructor(private readonly destinoService: DestinoService) { }

    @Post()
    create(@Body() createDestinoDto: Partial<Destino>) {
        return this.destinoService.create(createDestinoDto);
    }

    @Get()
    findAll() {
        return this.destinoService.findAll();
    }
}
