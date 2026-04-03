import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Equipo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    fmo: string;

    @Column({ nullable: true })
    marca: string;

    @Column({ nullable: true })
    nombre: string;

    @Column({ type: 'text', nullable: true })
    serial: string;
}
