import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmpleadoService } from './empleado.service';
import { Empleado } from './entities/empleado.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('empleados')
@ApiBearerAuth()
@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo empleado' })
    create(@Body() createEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.create(createEmpleadoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los empleados' })
    findAll() {
        return this.empleadoService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos de un empleado' })
    update(@Param('id') id: string, @Body() updateEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.update(+id, updateEmpleadoDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un empleado' })
    remove(@Param('id') id: string) {
        return this.empleadoService.remove(+id);
    }
}
