import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';

@Controller('usuarios')
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) { }

    @Post()
    create(@Body() createUsuarioDto: Partial<Usuario>) {
        return this.usuarioService.create(createUsuarioDto);
    }

    @Get('all')
    findAll() {
        return this.usuarioService.findAll();
    }

    @Get(':username')
    findOne(@Param('username') username: string) {
        return this.usuarioService.findOne(username);
    }

    @Patch('change-password/:id')
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
    update(@Param('id') id: string, @Body() data: Partial<Usuario>) {
        return this.usuarioService.update(+id, data);
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const success = await this.usuarioService.remove(+id);
        return { success };
    }
}
