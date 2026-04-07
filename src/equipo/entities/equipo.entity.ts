import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Equipo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    fmo: string;

    @Column({ nullable: true })
    marca: string;

    @Column({ nullable: true })
    nombre: string;

    @Column({ type: 'text', unique: true, nullable: true })
    serial: string;
}
