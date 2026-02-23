import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
