import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
    ) {}

    async logAction(data: Partial<AuditLog>): Promise<AuditLog> {
        const log = this.auditLogRepository.create(data);
        return this.auditLogRepository.save(log);
    }

    async getLogs(page: number = 1, limit: number = 15): Promise<{ data: AuditLog[]; total: number; page: number; limit: number; totalPages: number }> {
        const skip = (page - 1) * limit;
        const [data, total] = await this.auditLogRepository.findAndCount({
            order: { fechaHora: 'DESC' },
            skip,
            take: limit,
        });
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async searchLogs(q: string, limit: number = 10): Promise<{ data: AuditLog[]; total: number }> {
        const [data, total] = await this.auditLogRepository.findAndCount({
            where: { accion: Like(`%${q}%`) },
            order: { fechaHora: 'DESC' },
            take: Math.min(limit, 50),
        });
        return { data, total };
    }

    async getPaseHistory(numeroPase: string): Promise<{ data: AuditLog[]; total: number }> {
        const [data, total] = await this.auditLogRepository.findAndCount({
            where: { accion: Like(`%#${numeroPase}%`) },
            order: { fechaHora: 'DESC' },
        });
        return { data, total };
    }

    async getStats(): Promise<any> {
        const total = await this.auditLogRepository.count();
        const editsCount = await this.auditLogRepository.count({
            where: { accion: Like('%editado%') },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = await this.auditLogRepository.find({
            where: { fechaHora: MoreThanOrEqual(today) },
            order: { fechaHora: 'DESC' },
        });
        const todayEdits = todayLogs.filter((l) => l.accion.includes('editado')).length;

        // Most active user
        const allLogs = await this.auditLogRepository.find({
            select: ['usuarioNombre'],
        });
        const userCounts: Record<string, number> = {};
        for (const log of allLogs) {
            const name = log.usuarioNombre || 'Desconocido';
            userCounts[name] = (userCounts[name] || 0) + 1;
        }
        const mostActive = Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            editsCount,
            todayLogs: todayLogs.length,
            todayEdits,
            mostActiveUser: mostActive ? { nombre: mostActive[0], count: mostActive[1] } : null,
        };
    }
}
