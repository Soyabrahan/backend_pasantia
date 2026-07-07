import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';
import { Vehiculo } from '../../vehiculo/entities/vehiculo.entity';
import { Departamento } from '../../departamento/entities/departamento.entity';

@Entity()
export class Empleado {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ficha: string;

    @Column()
    nombre: string;

    @ManyToOne(() => Departamento, { nullable: true })
    @JoinColumn({ name: 'departamentoId' })
    departamento: Departamento;

    @Column({ nullable: true })
    departamentoId: number;

    @Column({ nullable: true })
    cargo: string;

    @Column({ nullable: true })
    rol: string;

    @ManyToMany(() => Vehiculo, (vehiculo) => vehiculo.conductores)
    vehiculos: Vehiculo[];

    @DeleteDateColumn()
    deletedAt: Date;
}
