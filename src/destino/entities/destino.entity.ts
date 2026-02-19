import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Destino {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column()
    direccion: string;

    @Column()
    telefono: string;
}
