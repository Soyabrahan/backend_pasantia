import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Equipo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fmo: string;

    @Column()
    marca: string;

    @Column()
    modelo: string;
}
