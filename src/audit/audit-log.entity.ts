import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('audit_logs')
export class AuditLog {
    @ApiProperty({ description: 'ID UUID único del registro de auditoría', example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'ID del usuario que realizó la acción', example: '1', nullable: true })
    @Column({ nullable: true })
    usuarioId: string;

    @ApiProperty({ description: 'Nombre del usuario que realizó la acción', example: 'Administrador', nullable: true })
    @Column({ nullable: true })
    usuarioNombre: string;

    @ApiProperty({ description: 'Ficha del usuario que realizó la acción', example: 'F12345', nullable: true })
    @Column({ nullable: true })
    usuarioFicha: string;

    @ApiProperty({ description: 'Acción realizada', example: 'CREAR_PASE' })
    @Column()
    accion: string;

    @ApiProperty({ description: 'Método HTTP de la petición (opcional)', example: 'POST', nullable: true })
    @Column({ nullable: true })
    metodo: string;

    @ApiProperty({ description: 'Ruta o endpoint accedido (opcional)', example: '/pases', nullable: true })
    @Column({ nullable: true })
    ruta: string;

    @ApiProperty({ description: 'Fecha y hora en que se registró la acción', example: '2026-06-14T19:00:00.000Z' })
    @CreateDateColumn()
    fechaHora: Date;
}

