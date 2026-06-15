import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmpleadoService } from './empleado.service';
import { Empleado } from './entities/empleado.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('empleados')
@ApiBearerAuth()
@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    @ApiOperation({ summary: 'Registrar un nuevo empleado' })
    @ApiBody({ type: Empleado, description: 'Datos del nuevo empleado' })
    @ApiResponse({ status: 201, description: 'Empleado registrado exitosamente.', type: Empleado })
    create(@Body() createEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.create(createEmpleadoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los empleados' })
    @ApiResponse({ status: 200, description: 'Lista de todos los empleados.', type: [Empleado] })
    findAll() {
        return this.empleadoService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos de un empleado' })
    @ApiParam({ name: 'id', description: 'ID numérico del empleado a actualizar' })
    @ApiBody({ type: Empleado, description: 'Nuevos datos parciales del empleado' })
    @ApiResponse({ status: 200, description: 'Datos del empleado actualizados exitosamente.', type: Empleado })
    update(@Param('id') id: string, @Body() updateEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.update(+id, updateEmpleadoDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un empleado' })
    @ApiParam({ name: 'id', description: 'ID numérico del empleado a eliminar' })
    @ApiResponse({ status: 200, description: 'Empleado eliminado exitosamente.' })
    remove(@Param('id') id: string) {
        return this.empleadoService.remove(+id);
    }
}

