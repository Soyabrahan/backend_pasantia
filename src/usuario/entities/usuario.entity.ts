import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ficha: string;

    @Column()
    contrasena: string;

    @Column()
    nombre: string;

    @Column()
    departamento: string;

    @Column()
    rol: string;
}
