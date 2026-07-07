import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Empleado } from '../../empleado/entities/empleado.entity';

@Entity()
export class Departamento {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @OneToMany(() => Empleado, (empleado) => empleado.departamento)
    empleados: Empleado[];

    @DeleteDateColumn()
    deletedAt: Date;
}
