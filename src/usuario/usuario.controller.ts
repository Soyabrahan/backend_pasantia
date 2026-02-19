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

    @Get(':username')
    findOne(@Param('username') username: string) {
        return this.usuarioService.findOne(username);
    }
}
