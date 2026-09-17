import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './audit-log.entity';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatResponse {
    reply: string;
    suggestedQuestions: string[];
}

@Injectable()
export class AuditChatService {
    private readonly logger = new Logger(AuditChatService.name);
    private readonly geminiModel = 'gemini-3.5-flash-lite';
    private readonly geminiApiKey: string;
    private readonly SYSTEM_PROMPT = `
Eres un asistente de auditoría especializado en el sistema de Pases FMO. Tu función es ayudar a los usuarios a consultar el registro de auditoría del sistema.

## BASE DE DATOS: audit_logs

La tabla audit_logs contiene:
- id: UUID único del registro
- usuarioId: ID del usuario que realizó la acción
- usuarioNombre: Nombre del usuario
- usuarioFicha: Ficha del usuario
- accion: Descripción textual de la acción realizada
- metodo: Método HTTP (GET, POST, PATCH, DELETE)
- ruta: Ruta del endpoint
- fechaHora: Fecha y hora del registro

## FORMATO DEL CAMPO "accion" (importante para interpretar):

### Ediciones de pases (PATCH /pases/:id):
"Pase #NUMERO editado (versión anterior ID X → nueva ID Y) — Cambios: CAMPO: 'valor_anterior' → 'valor_nuevo'; ..."

Los campos que pueden aparecer en los cambios son:
- Concepto: DONACION, DEVOLUCION, PRESTAMO, REPARACION, REVISION, VENDIDO, FORANEO
- N° Compra: número de orden de compra
- Tipo de Pago: CONTADO, CREDITO
- Observaciones
- Tiempo Estimado
- Solicitador: nombre del solicitante
- Conductor: nombre del conductor
- Autorizador: nombre del autorizador
- Despachador: nombre del despachador
- Destino: nombre del destino
- Vehículo: descripción del vehículo

### Otras acciones:
- "Exportación de Control PDF (rango X - Y)"
- "Exportación de Control Excel (rango X - Y)"
- "Descarga de PDF - Pase N° X"
- "Exportación de Excel - Pase N° X"
- "Inicio de sesión"
- "Cierre de sesión"
- "Creación de registro" (POST)
- "Actualización de registro" (PUT/PATCH genérico)
- "Eliminación de registro" (DELETE)
- "Creación de pase" (POST /pases)

## INSTRUCCIONES:
1. Responde SIEMPRE en español, de forma clara y amigable.
2. Cuando te pregunten por ediciones, busca en el campo "accion" el patrón "editado".
3. Si te preguntan por un pase específico, busca por "#NUMERO" en el campo accion.
4. Si no encuentras información relevante, indícalo honestamente.
5. Sé conciso pero informativo. Incluye detalles como: quién, cuándo, qué cambió.
6. SIEMPRE que necesites consultar datos, usa las funciones disponibles.
7. Después de cada respuesta, sugiere 3 preguntas relacionadas que el usuario podría hacer a continuación.
`.trim();

    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        private configService: ConfigService,
    ) {
        this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        if (!this.geminiApiKey) {
            this.logger.warn('GEMINI_API_KEY no configurada. El chat de auditoría no funcionará.');
        }
    }

    async chat(message: string, history?: ChatMessage[]): Promise<ChatResponse> {
        try {
            if (!this.geminiApiKey) {
                return {
                    reply: 'La clave de API de Gemini no está configurada. Añade GEMINI_API_KEY al archivo .env para usar el chat de auditoría.',
                    suggestedQuestions: [],
                };
            }

            const contentMessages = [
                ...(history || []).map((msg) => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }],
                })),
                {
                    role: 'user',
                    parts: [{ text: message }],
                },
            ];

            this.logger.log(`Enviando petición al modelo ${this.geminiModel} con ${contentMessages.length} mensajes`);

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${this.geminiModel}:generateContent?key=${this.geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        systemInstruction: {
                            parts: [{ text: this.SYSTEM_PROMPT }],
                        },
                        contents: contentMessages,
                        generationConfig: {
                            temperature: 0.7,
                            topP: 0.8,
                            maxOutputTokens: 2048,
                        },
                    }),
                },
            );

            const payload = await response.json();

            if (!response.ok) {
                const messageError = payload?.error?.message || 'Error al contactar a Gemini';
                throw new Error(messageError);
            }

            const reply = payload.candidates?.[0]?.content?.parts
                ?.map((part: { text?: string }) => part.text || '')
                .join('')
                || 'No se pudo generar una respuesta.';

            const suggestedQuestions = this.generateSuggestedQuestions(message);

            return { reply, suggestedQuestions };
        } catch (error: any) {
            this.logger.error('Error en chat de auditoría:', error.message || error);
            this.logger.error('Error completo:', JSON.stringify(error, null, 2));

            if (error.message?.includes('429') || error.status === 429) {
                return {
                    reply: 'Lo siento, el servicio de IA ha excedido su cuota gratuita por ahora. Por favor, intenta de nuevo más tarde o contacta al administrador para configurar una clave con mayor límite.',
                    suggestedQuestions: ['¿Cuál fue el último pase editado?', '¿Cuántas ediciones hubo hoy?', '¿Quién ha hecho más modificaciones?'],
                };
            }

            if (error.message?.includes('API_KEY') || error.status === 401 || error.status === 403) {
                return {
                    reply: 'Lo siento, la clave de API de Gemini no está configurada correctamente. Por favor, contacta al administrador del sistema.',
                    suggestedQuestions: [],
                };
            }

            return {
                reply: 'Lo siento, ocurrió un error al procesar tu consulta. Verifica la conexión con el servidor e intenta de nuevo.',
                suggestedQuestions: ['¿Cuál fue el último pase editado?', '¿Cuántas ediciones hubo hoy?', '¿Qué cambios se hicieron en un pase específico?'],
            };
        }
    }

    private async executeFunction(name: string, args: any): Promise<any> {
        this.logger.log(`Ejecutando función: ${name} con args: ${JSON.stringify(args)}`);

        switch (name) {
            case 'get_recent_edits':
                return this.getRecentEdits(args.limit || 5);
            case 'get_pase_history':
                return this.getPaseHistory(args.numeroPase);
            case 'search_logs':
                return this.searchLogs(args.query, args.limit || 10);
            case 'get_user_actions':
                return this.getUserActions(args.userName, args.limit || 10);
            case 'get_stats':
                return this.getStats();
            default:
                throw new Error(`Función desconocida: ${name}`);
        }
    }

    private async getRecentEdits(limit: number): Promise<any> {
        limit = Math.min(Math.max(limit, 1), 20);
        const logs = await this.auditLogRepository.find({
            where: { accion: Like('%editado%') },
            order: { fechaHora: 'DESC' },
            take: limit,
        });
        return {
            count: logs.length,
            results: logs.map((log) => ({
                id: log.id,
                accion: log.accion,
                usuarioNombre: log.usuarioNombre,
                usuarioFicha: log.usuarioFicha,
                fechaHora: log.fechaHora,
            })),
        };
    }

    private async getPaseHistory(numeroPase: string): Promise<any> {
        const logs = await this.auditLogRepository.find({
            where: { accion: Like(`%#${numeroPase}%`) },
            order: { fechaHora: 'DESC' },
        });
        return {
            numeroPase,
            count: logs.length,
            results: logs.map((log) => ({
                id: log.id,
                accion: log.accion,
                usuarioNombre: log.usuarioNombre,
                usuarioFicha: log.usuarioFicha,
                metodo: log.metodo,
                ruta: log.ruta,
                fechaHora: log.fechaHora,
            })),
        };
    }

    private async searchLogs(query: string, limit: number): Promise<any> {
        limit = Math.min(Math.max(limit, 1), 20);
        const logs = await this.auditLogRepository.find({
            where: { accion: Like(`%${query}%`) },
            order: { fechaHora: 'DESC' },
            take: limit,
        });
        return {
            query,
            count: logs.length,
            results: logs.map((log) => ({
                id: log.id,
                accion: log.accion,
                usuarioNombre: log.usuarioNombre,
                usuarioFicha: log.usuarioFicha,
                fechaHora: log.fechaHora,
            })),
        };
    }

    private async getUserActions(userName: string, limit: number): Promise<any> {
        limit = Math.min(Math.max(limit, 1), 20);
        const logs = await this.auditLogRepository.find({
            where: { usuarioNombre: Like(`%${userName}%`) },
            order: { fechaHora: 'DESC' },
            take: limit,
        });
        return {
            userName,
            count: logs.length,
            results: logs.map((log) => ({
                id: log.id,
                accion: log.accion,
                usuarioNombre: log.usuarioNombre,
                usuarioFicha: log.usuarioFicha,
                fechaHora: log.fechaHora,
            })),
        };
    }

    private async getStats(): Promise<any> {
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

        const editLogs = await this.auditLogRepository.find({
            where: { accion: Like('%editado%') },
            select: ['usuarioNombre'],
        });
        const editCounts: Record<string, number> = {};
        for (const log of editLogs) {
            const name = log.usuarioNombre || 'Desconocido';
            editCounts[name] = (editCounts[name] || 0) + 1;
        }
        const mostActive = Object.entries(editCounts).sort((a, b) => b[1] - a[1])[0];

        return {
            total,
            editsCount,
            todayLogs: todayLogs.length,
            todayEdits,
            mostActiveUser: mostActive ? { nombre: mostActive[0], count: mostActive[1] } : null,
        };
    }

    private generateSuggestedQuestions(lastMessage: string): string[] {
        const baseQuestions = [
            '¿Cuál fue el último pase editado?',
            '¿Qué cambios se hicieron en el pase 86467?',
            '¿Cuántas ediciones hubo hoy?',
            '¿Quién ha hecho más modificaciones?',
            '¿Qué pases se modificaron esta semana?',
        ];

        if (lastMessage.toLowerCase().includes('último') || lastMessage.toLowerCase().includes('ultimo')) {
            return [
                '¿Qué cambios específicos se hicieron?',
                '¿Quién más ha editado pases recientemente?',
                '¿Cuántas ediciones hubo hoy?',
            ];
        }
        if (lastMessage.toLowerCase().includes('estadística') || lastMessage.toLowerCase().includes('estadistic')) {
            return [
                '¿Cuántos pases se crearon hoy?',
                '¿Quién es el usuario más activo?',
                '¿Cuál fue el último pase editado?',
            ];
        }

        return baseQuestions.sort(() => Math.random() - 0.5).slice(0, 3);
    }
}
