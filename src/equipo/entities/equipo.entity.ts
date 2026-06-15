import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Marca } from '../../marca/entities/marca.entity';

@Entity()
export class Equipo {
    @ApiProperty({ description: 'ID autogenerado del equipo', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Código FMO del equipo', example: 'FMO-1234', nullable: true })
    @Column({ unique: true, nullable: true })
    fmo: string;

    @ApiProperty({ description: 'Nombre o descripción del equipo', example: 'Laptop Dell Latitude', nullable: true })
    @Column({ nullable: true })
    nombre: string;

    @ApiProperty({ description: 'ID de la marca asociada', example: 1, nullable: true })
    @Column({ nullable: true })
    marcaId: number | null;

    @ManyToOne(() => Marca)
    @JoinColumn({ name: 'marcaId' })
    marca: Marca;

    @ApiProperty({ description: 'Número de serie único del equipo', example: 'ABCD1234EFGH', nullable: true })
    @Column({ type: 'text', unique: true, nullable: true })
    serial: string;

    @DeleteDateColumn()
    deletedAt: Date;
}

