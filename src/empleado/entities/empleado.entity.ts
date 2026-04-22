import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, DeleteDateColumn } from 'typeorm';
import { Vehiculo } from '../../vehiculo/entities/vehiculo.entity';

@Entity()
export class Empleado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ficha: string;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    departamento: string;

    @Column({ nullable: true })
    cargo: string;

    @Column({ nullable: true })
    rol: string; // "Solicitante", "Conductor", "Despachador"

    @ManyToMany(() => Vehiculo, (vehiculo) => vehiculo.conductores)
    vehiculos: Vehiculo[];

    @DeleteDateColumn()
    deletedAt: Date;
}
