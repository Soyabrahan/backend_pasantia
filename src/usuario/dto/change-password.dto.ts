import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
    @ApiProperty({ description: 'Contraseña actual del usuario', example: '123456' })
    currentPass: string;

    @ApiProperty({ description: 'Nueva contraseña elegida por el usuario', example: 'nuevaSegura123' })
    newPass: string;
}
