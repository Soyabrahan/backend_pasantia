import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    usuarioId: string;

    @Column({ nullable: true })
    usuarioNombre: string;

    @Column({ nullable: true })
    usuarioFicha: string;

    @Column()
    accion: string;

    @Column({ nullable: true })
    metodo: string;

    @Column({ nullable: true })
    ruta: string;

    @CreateDateColumn()
    fechaHora: Date;
}
