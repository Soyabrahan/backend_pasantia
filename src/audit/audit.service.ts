import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
