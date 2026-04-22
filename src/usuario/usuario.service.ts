import { Injectable, OnModuleInit, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService implements OnModuleInit {
    constructor(
        @InjectRepository(Usuario)
        private usuarioRepository: Repository<Usuario>,
    ) { }

    async onModuleInit() {
        const admin = await this.usuarioRepository.findOneBy({ ficha: '0000' });
        if (!admin) {
            const salt = await bcrypt.genSalt();
            const hashedAdminPass = await bcrypt.hash('admin', salt);
            await this.usuarioRepository.save({
                ficha: '0000',
                nombre: 'Administrador',
                contrasena: hashedAdminPass,
                rol: 'Administrador'
            });
            console.log('Usuario administrador por defecto creado: 0000 / admin');
        }
    }

    async findOne(identifier: string): Promise<Usuario | null> {
        return this.usuarioRepository.findOne({
            where: [
                { ficha: identifier },
                { nombre: identifier }
            ]
        });
    }

    async findOneById(id: number): Promise<Usuario | null> {
        return this.usuarioRepository.findOneBy({ id });
    }

    async create(usuario: Partial<Usuario>): Promise<Usuario> {
        const existing = await this.usuarioRepository.findOneBy({ ficha: usuario.ficha });
        if (existing) {
            throw new ConflictException(`La ficha ${usuario.ficha} ya está registrada en el sistema.`);
        }

        if (usuario.contrasena) {
            const salt = await bcrypt.genSalt();
            usuario.contrasena = await bcrypt.hash(usuario.contrasena, salt);
        }
        const newUsuario = this.usuarioRepository.create(usuario);
        return this.usuarioRepository.save(newUsuario);
    }

    async findAll(): Promise<Usuario[]> {
        return this.usuarioRepository.find();
    }

    async update(id: number, data: Partial<Usuario>): Promise<Usuario | null> {
        const usuario = await this.usuarioRepository.findOneBy({ id });
        if (!usuario) return null;

        if (data.contrasena) {
            const salt = await bcrypt.genSalt();
            data.contrasena = await bcrypt.hash(data.contrasena, salt);
        }

        Object.assign(usuario, data);
        return this.usuarioRepository.save(usuario);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.usuarioRepository.softDelete(id);
        return (result.affected ?? 0) > 0;
    }

    async changePassword(id: number, currentPass: string, newPass: string): Promise<boolean> {
        const usuario = await this.usuarioRepository.findOneBy({ id });
        if (!usuario) return false;

        const isMatch = await bcrypt.compare(currentPass, usuario.contrasena);
        if (!isMatch) return false;

        const salt = await bcrypt.genSalt();
        usuario.contrasena = await bcrypt.hash(newPass, salt);
        await this.usuarioRepository.save(usuario);
        return true;
    }

    async adminResetPassword(id: number): Promise<boolean> {
        const usuario = await this.usuarioRepository.findOneBy({ id });
        if (!usuario) return false;

        const salt = await bcrypt.genSalt();
        // Reset to their own ficha as default password
        usuario.contrasena = await bcrypt.hash(usuario.ficha, salt);
        await this.usuarioRepository.save(usuario);
        return true;
    }
}
