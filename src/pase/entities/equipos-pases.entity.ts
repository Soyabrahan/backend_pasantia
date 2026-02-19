import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Pase } from './pase.entity';
import { Equipo } from '../../equipo/entities/equipo.entity';

// Entity for linking Pase and Equipo with quantity
@Entity('equipos_pases')
export class EquiposPases {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    paseId: number;

    @Column()
    equipoId: number;

    @Column()
    cantidad: number;

    @ManyToOne(() => Pase, (pase) => pase.equiposPases)
    @JoinColumn({ name: 'paseId' })
    pase: Pase;

    @ManyToOne(() => Equipo)
    @JoinColumn({ name: 'equipoId' })
    equipo: Equipo;
}
