import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usuarioService: UsuarioService,
        private jwtService: JwtService,
    ) { }

    async validateUser(ficha: string, pass: string): Promise<any> {
        const user = await this.usuarioService.findOne(ficha);
        if (user && (await bcrypt.compare(pass, user.contrasena))) {
            const { contrasena, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.ficha, sub: user.id, role: user.rol };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async register(userDto: any) {
        return this.usuarioService.create(userDto);
    }
}
