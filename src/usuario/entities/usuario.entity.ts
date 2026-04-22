import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { Pase } from '../../pase/entities/pase.entity';

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

    @OneToMany(() => Pase, (pase) => pase.usuario)
    pases: Pase[];

    @DeleteDateColumn()
    deletedAt: Date;
}
