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

    async getLogs(): Promise<AuditLog[]> {
        return this.auditLogRepository.find({
            order: { fechaHora: 'DESC' },
            take: 100 // Límite de 100 registros para no saturar
        });
    }
}
