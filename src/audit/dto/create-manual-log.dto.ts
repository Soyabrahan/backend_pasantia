import { ApiProperty } from '@nestjs/swagger';

export class CreateManualLogDto {
    @ApiProperty({ description: 'Acción realizada por el usuario', example: 'ABRIR_PANTALLA_INICIO' })
    accion: string;

    @ApiProperty({ description: 'Método de ejecución o contexto (opcional)', example: 'UI_CLICK', required: false })
    metodo?: string;

    @ApiProperty({ description: 'Ruta, sección o componente de la acción (opcional)', example: '/home', required: false })
    ruta?: string;
}
