import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Usuario } from '../../usuario/entities/usuario.entity';
import { Vehiculo } from '../../vehiculo/entities/vehiculo.entity';
import { Destino } from '../../destino/entities/destino.entity';
import { EquiposPases } from './equipos-pases.entity';

@Entity()
export class Pase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    numeroPase: string;

    @Column()
    concepto: string; // Enum?

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha_emision: Date;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'solicitadorId' })
    solicitador: Usuario;

    @Column()
    solicitadorId: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'conductorId' })
    conductor: Usuario;

    @Column({ nullable: true })
    conductorId: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'autorizadorId' })
    autorizador: Usuario;

    @Column({ nullable: true })
    autorizadorId: number;

    @ManyToOne(() => Usuario)
    @JoinColumn({ name: 'despachadorId' })
    despachador: Usuario;

    @Column({ nullable: true })
    despachadorId: number;

    @ManyToOne(() => Vehiculo)
    @JoinColumn({ name: 'vehiculoId' })
    vehiculo: Vehiculo;

    @Column({ nullable: true })
    vehiculoId: number;

    @ManyToOne(() => Destino)
    @JoinColumn({ name: 'destinoId' })
    destino: Destino;

    @Column({ nullable: true })
    destinoId: number;

    @Column({ nullable: true })
    numero_compra: string;

    @Column({ nullable: true })
    tipo_pago: string;

    @OneToMany(() => EquiposPases, (equiposPases) => equiposPases.pase)
    equiposPases: EquiposPases[];
}
