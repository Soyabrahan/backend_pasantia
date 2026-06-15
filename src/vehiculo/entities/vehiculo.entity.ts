import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity()
export class Vehiculo {
    @ApiProperty({ description: 'ID autogenerado del vehículo', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Número de placa único del vehículo', example: 'AA111XX' })
    @Column()
    placa: string;

    @ApiProperty({ description: 'Marca del vehículo', example: 'Toyota', nullable: true })
    @Column({ nullable: true })
    marca: string;

    @ApiProperty({ description: 'Modelo del vehículo', example: 'Hilux', nullable: true })
    @Column({ nullable: true })
    modelo: string;

    @ApiProperty({ description: 'Indica si el vehículo pertenece a la flota FMO', example: true })
    @Column({ default: false })
    esFMO: boolean;

    @ApiProperty({ description: 'Número identificador de flota FMO (requerido si esFMO es true)', example: 'FMO-888', nullable: true })
    @Column({ nullable: true })
    fmo: string;

    @ManyToMany(() => Empleado, (empleado) => empleado.vehiculos)
    @JoinTable({ name: 'empleado_vehiculo' })
    conductores: Empleado[];

    @DeleteDateColumn()
    deletedAt: Date;
}

