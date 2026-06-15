import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Vehiculo } from '../../vehiculo/entities/vehiculo.entity';

@Entity()
export class Empleado {
    @ApiProperty({ description: 'ID autogenerado del empleado', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Número de ficha único del empleado', example: 'F87654' })
    @Column({ unique: true })
    ficha: string;

    @ApiProperty({ description: 'Nombre completo del empleado', example: 'Pedro Armas' })
    @Column()
    nombre: string;

    @ApiProperty({ description: 'Departamento al que pertenece el empleado', example: 'Telecomunicaciones', nullable: true })
    @Column({ nullable: true })
    departamento: string;

    @ApiProperty({ description: 'Cargo o puesto del empleado', example: 'Supervisor de Redes', nullable: true })
    @Column({ nullable: true })
    cargo: string;

    @ApiProperty({ description: 'Rol asignado al empleado (Solicitante, Conductor, Despachador, Autorizador)', example: 'Conductor', nullable: true })
    @Column({ nullable: true })
    rol: string; // "Solicitante", "Conductor", "Despachador"

    @ManyToMany(() => Vehiculo, (vehiculo) => vehiculo.conductores)
    vehiculos: Vehiculo[];

    @DeleteDateColumn()
    deletedAt: Date;
}

