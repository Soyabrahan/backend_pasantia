import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Destino {
    @ApiProperty({ description: 'ID autogenerado del destino', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nombre del destino o empresa receptora', example: 'Almacén Principal Ferrominera' })
    @Column()
    nombre: string;

    @ApiProperty({ description: 'Dirección física del destino', example: 'Puerto Ordaz, Av. Caracas' })
    @Column()
    direccion: string;

    @ApiProperty({ description: 'Teléfono de contacto del destino', example: '0286-9601111' })
    @Column()
    telefono: string;

    @DeleteDateColumn()
    deletedAt: Date;
}

