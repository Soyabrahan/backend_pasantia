import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
    @ApiProperty({ description: 'Mensaje del usuario', example: '¿cuál fue el último pase editado?' })
    message: string;

    @ApiProperty({ description: 'Historial de la conversación (opcional)', required: false, example: [] })
    history?: { role: 'user' | 'assistant'; content: string }[];
}
