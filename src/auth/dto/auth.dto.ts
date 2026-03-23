import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Nombre de usuario', example: 'admin' })
    username: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: '123456' })
    password: string;
}

export class RegisterDto {
    @ApiProperty({ description: 'Nombre de usuario', example: 'abran' })
    username: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'segura123' })
    password: string;

    @ApiProperty({ description: 'Nombre completo del usuario', example: 'Abran Ramos' })
    nombre: string;
}
