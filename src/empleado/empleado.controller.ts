import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { Empleado } from './entities/empleado.entity';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('empleados')
@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) { }

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

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos de un empleado' })
    update(@Param('id') id: string, @Body() updateEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.update(+id, updateEmpleadoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un empleado' })
    remove(@Param('id') id: string) {
        return this.empleadoService.remove(+id);
    }
}
