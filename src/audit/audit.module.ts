import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from './audit-log.entity';
import { AuditService } from './audit.service';
import { AuditChatService } from './audit-chat.service';
import { AuditController } from './audit.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    providers: [AuditService, AuditChatService],
    controllers: [AuditController],
    exports: [AuditService],
})
export class AuditModule {}
