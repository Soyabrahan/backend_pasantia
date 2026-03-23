import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo usuario administrador/operador' })
    create(@Body() createUsuarioDto: Partial<Usuario>) {
        return this.usuarioService.create(createUsuarioDto);
    }

    @Get('all')
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':username')
    @ApiOperation({ summary: 'Obtener un usuario por su nombre de usuario' })
    findOne(@Param('username') username: string) {
        return this.usuarioService.findOne(username);
    }

    @Patch('change-password/:id')
    @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
    async changePassword(
        @Param('id') id: string,
        @Body() body: { currentPass: string; newPass: string },
    ) {
        const success = await this.usuarioService.changePassword(+id, body.currentPass, body.newPass);
        if (!success) {
            return { success: false, message: 'Contraseña actual incorrecta o usuario no encontrado' };
        }
        return { success: true };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos básicos de un usuario' })
    update(@Param('id') id: string, @Body() data: Partial<Usuario>) {
        return this.usuarioService.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un usuario' })
    async remove(@Param('id') id: string) {
        const success = await this.usuarioService.remove(+id);
        return { success };
    }
}
