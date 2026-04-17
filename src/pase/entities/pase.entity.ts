import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm';
import { Vehiculo } from '../../vehiculo/entities/vehiculo.entity';
import { Destino } from '../../destino/entities/destino.entity';
import { Empleado } from '../../empleado/entities/empleado.entity';
import { EquiposPases } from './equipos-pases.entity';
import { Usuario } from '../../usuario/entities/usuario.entity';

@Entity()
export class Pase {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    numeroPase: string;

    @Column()
    concepto: string;

    @CreateDateColumn()
    fecha_emision: Date;

    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'solicitadorId' })
    solicitador: Empleado;

    @Column()
    solicitadorId: number;

    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'conductorId' })
    conductor: Empleado;

    @Column({ nullable: true })
    conductorId: number;

    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'autorizadorId' })
    autorizador: Empleado;

    @Column({ nullable: true })
    autorizadorId: number;

    @ManyToOne(() => Empleado)
    @JoinColumn({ name: 'despachadorId' })
    despachador: Empleado;

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

    @Column({ type: 'text', nullable: true })
    observaciones: string;

    @Column({ nullable: true })
    tiempo_estimado: string;

    @Column({ type: 'text', nullable: true })
    solicitud: string;

    @OneToMany(() => EquiposPases, (equiposPases) => equiposPases.pase)
    equiposPases: EquiposPases[];

    @ManyToOne(() => Usuario, (usuario) => usuario.pases)
    @JoinColumn({ name: 'usuarioId' })
    usuario: Usuario;

    @Column({ nullable: true })
    usuarioId: number;
}
