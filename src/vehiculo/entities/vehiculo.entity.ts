import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Vehiculo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    placa: string;

    @Column({ default: false })
    esFMO: boolean;

    @Column({ nullable: true })
    fmo: string;
}
