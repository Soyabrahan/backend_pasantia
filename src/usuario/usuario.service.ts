import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) { }

    async findOne(username: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOneBy({ ficha: username });
    }

    async create(usuario: Partial<Usuario>): Promise<Usuario> {
        const newUsuario = this.usuarioRepository.create(usuario);
        return this.usuarioRepository.save(newUsuario);
    }
}
