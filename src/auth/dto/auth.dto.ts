import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Ficha del usuario', example: '0000' })
    ficha: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'admin' })
    contrasena: string;
}

export class RegisterDto {
    @ApiProperty({ description: 'Ficha del usuario', example: '0563' })
    ficha: string;

    @ApiProperty({ description: 'Contraseña del usuario', example: 'segura123' })
    contrasena: string;

    @ApiProperty({ description: 'Nombre completo del usuario', example: 'Abran Ramos' })
    nombre: string;
}
