import { ApiProperty } from '@nestjs/swagger';

export class CreatePaseDto {
    @ApiProperty({ description: 'Número único del pase', example: 'P-001' })
    numeroPase: string;

    @ApiProperty({ description: 'Concepto del pase (ej: DONACION, PRESTAMO)', example: 'DONACION' })
    concepto: string;

    @ApiProperty({ description: 'ID del empleado que solicita', example: 1 })
    solicitadorId: number;

    @ApiProperty({ description: 'ID del conductor (opcional)', example: 2, required: false })
    conductorId?: number;

    @ApiProperty({ description: 'ID del autorizador (opcional)', example: 3, required: false })
    autorizadorId?: number;

    @ApiProperty({ description: 'ID del despachador (opcional)', example: 4, required: false })
    despachadorId?: number;

    @ApiProperty({ description: 'ID del vehículo (opcional)', example: 1, required: false })
    vehiculoId?: number;

    @ApiProperty({ description: 'ID del destino (opcional)', example: 1, required: false })
    destinoId?: number;

    @ApiProperty({ description: 'Número de compra (opcional)', example: 'C-123', required: false })
    numero_compra?: string;

    @ApiProperty({ description: 'Tipo de pago (opcional)', example: 'CREDITO', required: false })
    tipo_pago?: string;

    @ApiProperty({ 
        description: 'Lista de equipos asociados al pase', 
        type: 'array',
        items: {
            type: 'object',
            properties: {
                equipoId: { type: 'number', example: 1 },
                cantidad: { type: 'number', example: 2 }
            }
        },
        required: false 
    })
    equipos?: { equipoId: number; cantidad: number }[];
}

export class UpdatePaseDto extends CreatePaseDto {}
