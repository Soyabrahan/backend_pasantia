import { Entity, Column, PrimaryGeneratedColumn, OneToMany, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Pase } from '../../pase/entities/pase.entity';

@Entity()
export class Usuario {
    @ApiProperty({ description: 'ID autogenerado del usuario', example: 1 })
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty({ description: 'Ficha única de identificación del usuario', example: 'F12345' })
    @Column({ unique: true })
    ficha: string;

    @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez', nullable: true })
    @Column({ nullable: true })
    nombre: string;

    @Column()
    contrasena: string;

    @ApiProperty({ description: 'Rol de acceso del usuario (Administrador, Usuario)', example: 'Usuario' })
    @Column()
    rol: string; // Access roles: "Administrador", "Usuario"

    @OneToMany(() => Pase, (pase) => pase.usuario)
    pases: Pase[];

    @DeleteDateColumn()
    deletedAt: Date;
}

