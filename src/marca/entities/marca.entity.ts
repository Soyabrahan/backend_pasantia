import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Marca {
    @ApiProperty({ description: 'ID autogenerado de la marca', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Nombre único de la marca', example: 'Caterpillar' })
    @Column({ unique: true })
    nombre: string;
}

