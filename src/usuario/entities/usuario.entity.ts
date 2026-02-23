import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Usuario {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    ficha: string;

    @Column({ nullable: true })
    nombre: string;

    @Column()
    contrasena: string;

    @Column()
    rol: string; // Access roles: "Administrador", "Usuario"
}
