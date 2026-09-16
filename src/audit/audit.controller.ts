import { Controller, Get, Post, Body, UseGuards, HttpCode, Req, Query, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditChatService } from './audit-chat.service';
import { CreateManualLogDto } from './dto/create-manual-log.dto';
import { ChatRequestDto } from './dto/chat-request.dto';

@ApiTags('auditoria')
@Controller('auditoria')
export class AuditController {
    constructor(
        private readonly auditService: AuditService,
        private readonly auditChatService: AuditChatService,
    ) {}

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

    @UseGuards(AuthGuard('jwt'))
    @Post('chat')
    @HttpCode(200)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Chat inteligente de auditoría con IA' })
    @ApiBody({ type: ChatRequestDto, description: 'Mensaje del usuario para el asistente de auditoría' })
    @ApiResponse({ status: 200, description: 'Respuesta del asistente de auditoría.' })
    async chat(@Body() body: ChatRequestDto) {
        return this.auditChatService.chat(body.message, body.history);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('search')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Buscar en los registros de auditoría' })
    @ApiQuery({ name: 'q', required: true, type: String, description: 'Texto a buscar' })
    @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
    @ApiResponse({ status: 200, description: 'Resultados de la búsqueda.' })
    async search(
        @Query('q') q: string,
        @Query('limit') limit: number = 10,
    ) {
        return this.auditService.searchLogs(q, limit);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('pases/:numeroPase')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener el historial de auditoría de un pase específico' })
    @ApiResponse({ status: 200, description: 'Historial de auditoría del pase.' })
    async getPaseHistory(@Param('numeroPase') numeroPase: string) {
        return this.auditService.getPaseHistory(numeroPase);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('stats')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obtener estadísticas rápidas de auditoría' })
    @ApiResponse({ status: 200, description: 'Estadísticas de auditoría.' })
    async getStats() {
        return this.auditService.getStats();
    }
}
