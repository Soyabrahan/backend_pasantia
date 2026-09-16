import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from './audit-log.entity';
import OpenAI from 'openai';

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
    private openai: OpenAI;
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

    private readonly tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
        {
            type: 'function',
            function: {
                name: 'get_recent_edits',
                description: 'Obtiene las ediciones de pases más recientes en el sistema',
                parameters: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', description: 'Cantidad de resultados a devolver (máximo 20)' },
                    },
                    required: ['limit'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'get_pase_history',
                description: 'Obtiene todo el historial de auditoría de un pase específico por su número',
                parameters: {
                    type: 'object',
                    properties: {
                        numeroPase: { type: 'string', description: 'Número del pase a consultar (ej: 86467)' },
                    },
                    required: ['numeroPase'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'search_logs',
                description: 'Busca en los registros de auditoría por cualquier texto',
                parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string', description: 'Texto a buscar en el campo accion' },
                        limit: { type: 'number', description: 'Cantidad de resultados (máximo 20)' },
                    },
                    required: ['query'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'get_user_actions',
                description: 'Obtiene las acciones realizadas por un usuario específico',
                parameters: {
                    type: 'object',
                    properties: {
                        userName: { type: 'string', description: 'Nombre del usuario a consultar' },
                        limit: { type: 'number', description: 'Cantidad de resultados (máximo 20)' },
                    },
                    required: ['userName', 'limit'],
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'get_stats',
                description: 'Obtiene estadísticas rápidas del sistema de auditoría',
                parameters: {
                    type: 'object',
                    properties: {},
                    required: [],
                },
            },
        },
    ];

    constructor(
        @InjectRepository(AuditLog)
        private auditLogRepository: Repository<AuditLog>,
        private configService: ConfigService,
    ) {
        const apiKey = this.configService.get<string>('NVIDIA_API_KEY');
        if (!apiKey) {
            this.logger.warn('NVIDIA_API_KEY no configurada. El chat de auditoría no funcionará.');
        }
        this.openai = new OpenAI({
            apiKey: apiKey || '',
            baseURL: 'https://integrate.api.nvidia.com/v1',
            timeout: 60000,
            maxRetries: 2,
        });
    }

    async chat(message: string, history?: ChatMessage[]): Promise<ChatResponse> {
        try {
            const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                { role: 'system', content: this.SYSTEM_PROMPT },
                ...(history || []).map((msg) => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content,
                })),
                { role: 'user', content: message },
            ];

            this.logger.log(`Enviando petición al modelo nvidia/nemotron-3.5-lightning-30b-a3b con ${messages.length} mensajes`);

            const response = await this.openai.chat.completions.create({
                model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
                messages,
                tools: this.tools,
                tool_choice: 'auto',
                temperature: 1,
                top_p: 0.95,
                max_tokens: 16384,
                chat_template_kwargs: { enable_thinking: true },
                reasoning_budget: 16384,
            } as any);

            this.logger.log(`Respuesta recibida. finish_reason: ${response.choices[0]?.finish_reason}, tool_calls: ${response.choices[0]?.message?.tool_calls?.length || 0}`);

            let choice = response.choices[0];
            let safetyNet = 0;

            while (choice.finish_reason === 'tool_calls' && choice.message.tool_calls && safetyNet < 5) {
                safetyNet++;
                const toolCalls = choice.message.tool_calls;

                const toolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
                    ...messages,
                    choice.message,
                ];

                for (const toolCall of toolCalls) {
                    if (toolCall.type !== 'function') continue;
                    const fn = toolCall.function;
                    try {
                        const functionResult = await this.executeFunction(
                            fn.name,
                            JSON.parse(fn.arguments),
                        );
                        toolMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(functionResult),
                        });
                    } catch (error) {
                        this.logger.error(`Error executing function ${fn.name}:`, error);
                        toolMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({ error: 'Error al consultar la base de datos' }),
                        });
                    }
                }

                const followUp = await this.openai.chat.completions.create({
                    model: 'nvidia/nemotron-3.5-lightning-30b-a3b',
                    messages: toolMessages,
                    tools: this.tools,
                    tool_choice: 'auto',
                    temperature: 1,
                    top_p: 0.95,
                    max_tokens: 16384,
                    chat_template_kwargs: { enable_thinking: true },
                    reasoning_budget: 16384,
                } as any);

                choice = followUp.choices[0];
            }

            const reply = choice.message.content || 'No se pudo generar una respuesta.';
            const suggestedQuestions = this.generateSuggestedQuestions(message);

            return { reply, suggestedQuestions };
        } catch (error: any) {
            this.logger.error('Error en chat de auditoría:', error.message || error);
            this.logger.error('Error completo:', JSON.stringify(error, null, 2));

            if (error.status === 429 || error.message?.includes('429')) {
                return {
                    reply: 'Lo siento, el servicio de IA ha excedido su cuota gratuita por ahora. Por favor, intenta de nuevo más tarde o contacta al administrador para configurar una clave con mayor límite.',
                    suggestedQuestions: ['¿Cuál fue el último pase editado?', '¿Cuántas ediciones hubo hoy?', '¿Quién ha hecho más modificaciones?'],
                };
            }

            if (error.status === 401 || error.status === 403 || error.message?.includes('API_KEY')) {
                return {
                    reply: 'Lo siento, la clave de API de NVIDIA no está configurada correctamente. Por favor, contacta al administrador del sistema.',
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
