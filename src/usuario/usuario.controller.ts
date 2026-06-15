import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';

@ApiTags('usuarios')
@ApiBearerAuth()
@Controller('usuarios')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) { }

    @Post()
    @ApiOperation({ summary: 'Crear un nuevo usuario administrador/operador' })
    @ApiBody({ type: Usuario, description: 'Datos del nuevo usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.', type: Usuario })
    @ApiResponse({ status: 400, description: 'Petición incorrecta o ficha duplicada.' })
    create(@Body() createUsuarioDto: Partial<Usuario>) {
        return this.usuarioService.create(createUsuarioDto);
    }

    @Get('all')
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Lista de todos los usuarios registrados.', type: [Usuario] })
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':username')
    @ApiOperation({ summary: 'Obtener un usuario por su nombre de usuario' })
    @ApiParam({ name: 'username', description: 'Nombre de usuario (o ficha) a buscar' })
    @ApiResponse({ status: 200, description: 'Usuario encontrado.', type: Usuario })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado.' })
    findOne(@Param('username') username: string) {
        return this.usuarioService.findOne(username);
    }

    @Patch('change-password/:id')
    @ApiOperation({ summary: 'Cambiar la contraseña de un usuario' })
    @ApiParam({ name: 'id', description: 'ID numérico del usuario' })
    @ApiBody({ type: ChangePasswordDto })
    @ApiResponse({ status: 200, description: 'Resultado de la operación de cambio de contraseña.' })
    async changePassword(
        @Param('id') id: string,
        @Body() body: ChangePasswordDto,
    ) {
        const success = await this.usuarioService.changePassword(+id, body.currentPass, body.newPass);
        if (!success) {
            return { success: false, message: 'Contraseña actual incorrecta o usuario no encontrado' };
        }
        return { success: true };
    }

    @Patch('admin-reset-password/:id')
    @ApiOperation({ summary: 'Resetear contraseña de usuario a la por defecto (Admin)' })
    @ApiParam({ name: 'id', description: 'ID numérico del usuario' })
    @ApiResponse({ status: 200, description: 'Resultado de la operación de reseteo.' })
    async adminResetPassword(@Param('id') id: string) {
        const success = await this.usuarioService.adminResetPassword(+id);
        return { success };
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar datos básicos de un usuario' })
    @ApiParam({ name: 'id', description: 'ID numérico del usuario' })
    @ApiBody({ type: Usuario, description: 'Nuevos datos parciales del usuario' })
    @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.', type: Usuario })
    update(@Param('id') id: string, @Body() data: Partial<Usuario>) {
        return this.usuarioService.update(+id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar un usuario' })
    @ApiParam({ name: 'id', description: 'ID numérico del usuario' })
    @ApiResponse({ status: 200, description: 'Resultado de la eliminación.' })
    async remove(@Param('id') id: string) {
        const success = await this.usuarioService.remove(+id);
        return { success };
    }
}

