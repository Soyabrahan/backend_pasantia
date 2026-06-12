import { Entity, Column, PrimaryGeneratedColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Marca } from '../../marca/entities/marca.entity';

@Entity()
export class Equipo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true, nullable: true })
    fmo: string;

    @Column({ nullable: true })
    nombre: string;

    @Column({ nullable: true })
    marcaId: number | null;

    @ManyToOne(() => Marca)
    @JoinColumn({ name: 'marcaId' })
    marca: Marca;

    @Column({ type: 'text', unique: true, nullable: true })
    serial: string;

    @DeleteDateColumn()
    deletedAt: Date;
}
