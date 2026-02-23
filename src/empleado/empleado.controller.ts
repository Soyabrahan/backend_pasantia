import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmpleadoService } from './empleado.service';
import { Empleado } from './entities/empleado.entity';

@Controller('empleados')
export class EmpleadoController {
    constructor(private readonly empleadoService: EmpleadoService) { }

    @Post()
    create(@Body() createEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.create(createEmpleadoDto);
    }

    @Get()
    findAll() {
        return this.empleadoService.findAll();
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEmpleadoDto: Partial<Empleado>) {
        return this.empleadoService.update(+id, updateEmpleadoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.empleadoService.remove(+id);
    }
}
