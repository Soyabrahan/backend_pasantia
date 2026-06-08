import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DestinoService } from './destino.service';
import { Destino } from './entities/destino.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('destinos')
@ApiBearerAuth()
@Controller('destinos')
export class DestinoController {
    constructor(private readonly destinoService: DestinoService) { }

    @UseGuards(AuthGuard('jwt'))
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

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar un destino' })
    update(@Param('id') id: string, @Body() updateDestinoDto: Partial<Destino>) {
        return this.destinoService.update(+id, updateDestinoDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un destino' })
    remove(@Param('id') id: string) {
        return this.destinoService.delete(+id);
    }
}
