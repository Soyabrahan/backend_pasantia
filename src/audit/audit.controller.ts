import { Controller, Get, Post, Body, UseGuards, HttpCode, Req, Query } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { CreateManualLogDto } from './dto/create-manual-log.dto';

@ApiTags('auditoria')
@Controller('auditoria')
export class AuditController {
    constructor(private readonly auditService: AuditService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener los registros de auditoría' })
    @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 15 })
    @ApiResponse({ status: 200, description: 'Lista paginada de registros de auditoría.' })
    async getLogs(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 15,
    ) {
        return this.auditService.getLogs(page, limit);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('log')
    @HttpCode(200)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Registrar una acción de auditoría manualmente' })
    @ApiBody({ type: CreateManualLogDto, description: 'Datos de la acción a registrar manualmente' })
    @ApiResponse({ status: 200, description: 'Acción registrada correctamente.' })
    async log(@Body() data: CreateManualLogDto, @Req() req: any) {
        const user = req.user;
        await this.auditService.logAction({
            ...data,
            usuarioId: user?.id || null,
            usuarioNombre: user?.nombre || 'Desconocido',
            usuarioFicha: user?.ficha || null,
        });
        return { ok: true };
    }
}

