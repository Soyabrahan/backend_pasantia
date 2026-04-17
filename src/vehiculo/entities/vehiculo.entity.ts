import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity()
export class Vehiculo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    placa: string;

    @Column({ nullable: true })
    marca: string;

    @Column({ nullable: true })
    modelo: string;

    @Column({ default: false })
    esFMO: boolean;

    @Column({ nullable: true })
    fmo: string;

    @ManyToMany(() => Empleado, (empleado) => empleado.vehiculos)
    @JoinTable({ name: 'empleado_vehiculo' })
    conductores: Empleado[];
}
