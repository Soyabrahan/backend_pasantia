import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly auditService: AuditService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const { method, url, user } = req;

        // Solo nos interesan las consultas donde se modifican datos o inicio/cierre de sesión
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        
        return next.handle().pipe(
            tap(() => {
                if (isMutation) {
                    let accion = 'Modificación de datos';
                    
                    if (url.includes('/auth/login')) {
                        accion = 'Inicio de sesión';
                    } else if (url.includes('/auth/logout')) {
                        accion = 'Cierre de sesión';
                    } else if (method === 'POST') {
                        accion = 'Creación de registro';
                    } else if (method === 'PUT' || method === 'PATCH') {
                        accion = 'Actualización de registro';
                    } else if (method === 'DELETE') {
                        accion = 'Eliminación de registro';
                    }

                    // En el caso de login, el req.user contiene al usuario gracias a la estrategia local
                    // En otras rutas, req.user viene del token JWT
                    if (user) {
                        this.auditService.logAction({
                            usuarioId: user.id || null,
                            usuarioNombre: user.nombre || 'Desconocido',
                            usuarioFicha: user.ficha || null,
                            accion: accion,
                            metodo: method,
                            ruta: url,
                        }).catch(err => console.error('Error guardando audit log', err));
                    }
                }
            }),
        );
    }
}
