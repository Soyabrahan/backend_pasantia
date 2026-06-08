import { Controller, Get, Post, Body, UseGuards, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('auditoria')
@Controller('auditoria')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener los registros de auditoría' })
    @ApiResponse({ status: 200, description: 'Lista de registros de auditoría.' })
    async getLogs() {
        return this.auditService.getLogs();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('log')
    @HttpCode(200)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Registrar una acción de auditoría manualmente' })
    @ApiResponse({ status: 200, description: 'Acción registrada correctamente.' })
    async log(@Body() data: Record<string, any>) {
        await this.auditService.logAction(data);
        return { ok: true };
    }
}
