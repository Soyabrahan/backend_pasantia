import { Controller, Get, Post, Body, Patch, Param, UseGuards, Delete, Request } from '@nestjs/common';
import { PaseService } from './pase.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePaseDto, UpdatePaseDto } from './dto/create-pase.dto';

@ApiTags('pases')
@ApiBearerAuth()
@Controller('pases')
export class PaseController {
    constructor(private readonly paseService: PaseService) { }

    @ApiOperation({ summary: 'Obtener el último número de pase registrado' })
    @ApiResponse({ status: 200, description: 'Número del último pase.' })
    @Get('ultimo-numero')
    findLastNumero() {
        return this.paseService.findLastNumero();
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Crear un nuevo pase' })
    @ApiResponse({ status: 201, description: 'El pase ha sido creado exitosamente.' })
    @Post()
    create(@Body() createPaseDto: CreatePaseDto, @Request() req) {
        const userId = req.user.id;
        return this.paseService.create(createPaseDto, userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Obtener todos los pases' })
    @ApiResponse({ status: 200, description: 'Lista de todos los pases.' })
    @Get()
    findAll() {
        return this.paseService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Obtener un pase por ID' })
    @ApiResponse({ status: 200, description: 'El pase encontrado.' })
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paseService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Actualizar un pase' })
    @ApiResponse({ status: 200, description: 'El pase ha sido actualizado.' })
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePaseDto: UpdatePaseDto) {
        return this.paseService.update(+id, updatePaseDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Eliminar todos los pases (Limpieza)' })
    @ApiResponse({ status: 200, description: 'Todos los pases han sido eliminados.' })
    @Delete()
    removeAll() {
        return this.paseService.removeAll();
    }
}
