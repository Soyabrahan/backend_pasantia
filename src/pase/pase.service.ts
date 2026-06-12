import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pase } from './entities/pase.entity';
import { EquiposPases } from './entities/equipos-pases.entity';
import { Equipo } from '../equipo/entities/equipo.entity';
import { Marca } from '../marca/entities/marca.entity';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class PaseService {
    constructor(
        @InjectRepository(Pase)
        private paseRepository: Repository<Pase>,
        @InjectRepository(EquiposPases)
        private equiposPasesRepository: Repository<EquiposPases>,
        @InjectRepository(Equipo)
        private equipoRepository: Repository<Equipo>,
        @InjectRepository(Marca)
        private marcaRepository: Repository<Marca>,
        private readonly auditService: AuditService,
    ) { }

    async create(createPaseDto: any, userId?: number) {
        const { equipos, ...paseData } = createPaseDto;

        try {
            // Save Pase
            const pase = (this.paseRepository.create({ ...paseData, usuarioId: userId } as any) as unknown) as Pase;
            const savedPase = await this.paseRepository.save(pase);

            // Save EquiposRelation
            if (equipos && equipos.length > 0) {
                const equiposEntities: any[] = [];
                for (const e of equipos) {
                    const name = e.descripcion ? e.descripcion.toLowerCase() : undefined;
                    let marcaId: number | null = null;
                    if (e.marca) {
                        const marcaEntity = await this.marcaRepository.findOneBy({ nombre: e.marca.toLowerCase() });
                        if (marcaEntity) marcaId = marcaEntity.id;
                    }

                    if (e.fmos && e.fmos.length > 0) {
                        for (const f of e.fmos) {
                            // Find existing or create
                            let equipoItem = await this.equipoRepository.findOneBy({ fmo: f });
                            if (equipoItem) {
                                // Update existing equipment attributes
                                equipoItem.marcaId = marcaId;
                                equipoItem.nombre = name;
                                equipoItem = await this.equipoRepository.save(equipoItem);
                            } else {
                                equipoItem = await this.equipoRepository.save({
                                    fmo: f,
                                    marcaId,
                                    nombre: name,
                                } as any);
                            }
                            
                            if (equipoItem) {
                                equiposEntities.push({
                                    paseId: savedPase.id,
                                    equipoId: equipoItem.id,
                                    cantidad: 1
                                });
                            }
                        }
                    } else if (e.seriales && e.seriales.length > 0) {
                        for (const s of e.seriales) {
                            // Find existing or create
                            let equipoItem = await this.equipoRepository.findOneBy({ serial: s });
                            if (equipoItem) {
                                // Update existing
                                equipoItem.marcaId = marcaId;
                                equipoItem.nombre = name;
                                equipoItem = await this.equipoRepository.save(equipoItem);
                            } else {
                                equipoItem = await this.equipoRepository.save({
                                    serial: s,
                                    marcaId,
                                    nombre: name,
                                } as any);
                            }

                            if (equipoItem) {
                                equiposEntities.push({
                                    paseId: savedPase.id,
                                    equipoId: equipoItem.id,
                                    cantidad: 1
                                });
                            }
                        }
                    } else {
                        // "Ninguno" seleccionado (generic items)
                        const savedEquipo: any = await this.equipoRepository.save({
                            marcaId,
                            nombre: name,
                        } as any);
                        if (savedEquipo) {
                            equiposEntities.push({
                                paseId: savedPase.id,
                                equipoId: savedEquipo.id,
                                cantidad: e.cantidad || 1
                            });
                        }
                    }
                }
                if (equiposEntities.length > 0) {
                    await this.equiposPasesRepository.save(equiposEntities);
                }
            }

            return this.findOne(savedPase.id);
        } catch (error) {
            console.error('Error in PaseService create:', error);
            if (error?.message?.includes('numeroPase')) {
                throw new ConflictException('El número de pase ya existe.');
            }
            throw error;
        }
    }

    async update(id: number, updatePaseDto: any, user?: any) {
        const { equipos, ...paseData } = updatePaseDto;

        try {
            // Obtener pase viejo con relaciones para el diff
            const oldPase = await this.findOne(id);
            if (!oldPase) {
                throw new Error(`Pase con ID ${id} no encontrado`);
            }

            // Buscamos entidad base para guardar (sin relaciones)
            const existingPase = await this.paseRepository.findOneBy({ id });
            if (!existingPase) {
                throw new Error(`Pase con ID ${id} no encontrado`);
            }

            // Actualizamos los campos básicos del pase
            await this.paseRepository.save({
                ...existingPase,
                ...paseData,
                id: id
            });

            if (equipos) {
                // Eliminar relaciones existentes
                await this.equiposPasesRepository.delete({ paseId: id });

                // Recrear relaciones
                if (equipos.length > 0) {
                    const equiposEntities: any[] = [];
                    for (const e of equipos) {
                        const name = e.descripcion ? e.descripcion.toLowerCase() : undefined;
                        let marcaId: number | null = null;
                        if (e.marca) {
                            const marcaEntity = await this.marcaRepository.findOneBy({ nombre: e.marca.toLowerCase() });
                            if (marcaEntity) marcaId = marcaEntity.id;
                        }

                        if (e.fmos && e.fmos.length > 0) {
                            for (const f of e.fmos) {
                                let equipoItem = await this.equipoRepository.findOneBy({ fmo: f });
                                if (equipoItem) {
                                    // ACTUALIZAMOS el equipo existente
                                    equipoItem.marcaId = marcaId;
                                    equipoItem.nombre = name;
                                    equipoItem = await this.equipoRepository.save(equipoItem);
                                } else {
                                    // CREAMOS nuevo equipo con FMO
                                    equipoItem = await this.equipoRepository.save({
                                        fmo: f,
                                        marcaId,
                                        nombre: name,
                                    } as any);
                                }
                                
                                if (equipoItem) {
                                    equiposEntities.push({
                                        paseId: id,
                                        equipoId: equipoItem.id,
                                        cantidad: 1
                                    });
                                }
                            }
                        } else if (e.seriales && e.seriales.length > 0) {
                            for (const s of e.seriales) {
                                let equipoItem = await this.equipoRepository.findOneBy({ serial: s });
                                if (equipoItem) {
                                    // ACTUALIZAMOS el equipo existente
                                    equipoItem.marcaId = marcaId;
                                    equipoItem.nombre = name;
                                    equipoItem = await this.equipoRepository.save(equipoItem);
                                } else {
                                    // CREAMOS nuevo equipo con Serial
                                    equipoItem = await this.equipoRepository.save({
                                        serial: s,
                                        marcaId,
                                        nombre: name,
                                    } as any);
                                }

                                if (equipoItem) {
                                    equiposEntities.push({
                                        paseId: id,
                                        equipoId: equipoItem.id,
                                        cantidad: 1
                                    });
                                }
                            }
                        } else {
                            // Item genérico (sin FMO ni Serial)
                            let equipoItem: any = null;
                            
                            // Si tiene un ID de equipo previo, intentamos actualizarlo
                            if (e.id && !isNaN(Number(e.id))) {
                                equipoItem = await this.equipoRepository.findOneBy({ id: Number(e.id) });
                                if (equipoItem) {
                                    equipoItem.marcaId = marcaId;
                                    equipoItem.nombre = name;
                                    equipoItem = await this.equipoRepository.save(equipoItem);
                                }
                            }

                            // Si no se encontró o no tenía ID, creamos uno nuevo
                            if (!equipoItem) {
                                equipoItem = await this.equipoRepository.save({
                                    marcaId,
                                    nombre: name,
                                } as any);
                            }

                            if (equipoItem) {
                                equiposEntities.push({
                                    paseId: id,
                                    equipoId: equipoItem.id,
                                    cantidad: e.cantidad || 1
                                });
                            }
                        }
                    }
                    if (equiposEntities.length > 0) {
                        await this.equiposPasesRepository.save(equiposEntities);
                    }
                }
            }

            const newPase = await this.findOne(id);
            if (!newPase) {
                throw new Error(`Pase con ID ${id} no encontrado después de actualizar`);
            }

            const cambios = this.computePaseDiff(oldPase, newPase);
            if (cambios.length > 0 && user) {
                this.auditService.logAction({
                    usuarioId: user.id || null,
                    usuarioNombre: user.nombre || 'Desconocido',
                    usuarioFicha: user.ficha || null,
                    accion: `Actualización de pase #${oldPase.numeroPase}: ${cambios.join('; ')}`,
                    metodo: 'PATCH',
                    ruta: `/pases/${id}`,
                }).catch(err => console.error('Error guardando audit log detallado', err));
            }

            return newPase;
        } catch (error) {
            console.error('Error in PaseService update:', error);
            throw error;
        }
    }

    private computePaseDiff(oldPase: Pase, newPase: Pase): string[] {
        const cambios: string[] = [];

        const directFields: Record<string, string> = {
            concepto: 'concepto',
            numero_compra: 'n° compra',
            tipo_pago: 'tipo de pago',
            observaciones: 'observaciones',
            tiempo_estimado: 'tiempo estimado',
            solicitud: 'solicitud',
        };

        for (const [field, label] of Object.entries(directFields)) {
            const oldVal = (oldPase as any)[field] ?? '';
            const newVal = (newPase as any)[field] ?? '';
            if (String(oldVal) !== String(newVal)) {
                cambios.push(`${label} cambió de '${oldVal || '-(vacío)'}' a '${newVal || '-(vacío)'}'`);
            }
        }

        const relationDisplays: Record<string, string> = {
            solicitador: 'solicitador',
            conductor: 'conductor',
            autorizador: 'autorizador',
            despachador: 'despachador',
        };

        for (const [rel, label] of Object.entries(relationDisplays)) {
            const oldName = (oldPase as any)[rel]?.nombre ?? '-(vacío)';
            const newName = (newPase as any)[rel]?.nombre ?? '-(vacío)';
            if (oldName !== newName) {
                cambios.push(`${label} cambió de '${oldName}' a '${newName}'`);
            }
        }

        const oldPlaca = oldPase.vehiculo?.placa ?? '-(vacío)';
        const newPlaca = newPase.vehiculo?.placa ?? '-(vacío)';
        if (oldPlaca !== newPlaca) {
            cambios.push(`vehículo (placa) cambió de '${oldPlaca}' a '${newPlaca}'`);
        }

        const oldDestino = oldPase.destino?.nombre ?? '-(vacío)';
        const newDestino = newPase.destino?.nombre ?? '-(vacío)';
        if (oldDestino !== newDestino) {
            cambios.push(`destino cambió de '${oldDestino}' a '${newDestino}'`);
        }

        const oldEquiposStr = oldPase.equiposPases?.map(ep => `${ep.equipo?.nombre || 'sin nombre'} (x${ep.cantidad})`).sort().join(', ') || '-(vacío)';
        const newEquiposStr = newPase.equiposPases?.map(ep => `${ep.equipo?.nombre || 'sin nombre'} (x${ep.cantidad})`).sort().join(', ') || '-(vacío)';
        if (oldEquiposStr !== newEquiposStr) {
            cambios.push(`equipos modificados: de [${oldEquiposStr}] a [${newEquiposStr}]`);
        }

        return cambios;
    }

    findAll() {
        return this.paseRepository.createQueryBuilder('pase')
            .withDeleted()
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
            .leftJoinAndSelect('pase.vehiculo', 'vehiculo').withDeleted()
            .leftJoinAndSelect('pase.destino', 'destino').withDeleted()
            .leftJoinAndSelect('pase.equiposPases', 'equiposPases').withDeleted()
            .leftJoinAndSelect('equiposPases.equipo', 'equipo').withDeleted()
            .leftJoinAndSelect('pase.usuario', 'usuario').withDeleted()
            .orderBy('pase.id', 'DESC')
            .getMany();
    }

    async removeAll() {
        await this.equiposPasesRepository.softDelete({});
        return this.paseRepository.softDelete({});
    }

    findOne(id: number) {
        return this.paseRepository.createQueryBuilder('pase')
            .withDeleted()
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
            .leftJoinAndSelect('pase.vehiculo', 'vehiculo').withDeleted()
            .leftJoinAndSelect('pase.destino', 'destino').withDeleted()
            .leftJoinAndSelect('pase.equiposPases', 'equiposPases').withDeleted()
            .leftJoinAndSelect('equiposPases.equipo', 'equipo').withDeleted()
            .leftJoinAndSelect('pase.usuario', 'usuario').withDeleted()
            .where('pase.id = :id', { id })
            .getOne();
    }

    async findLastNumero() {
        const lastPase = await this.paseRepository.findOne({
            where: {},
            order: { id: 'DESC' }
        });
        return { numeroPase: lastPase ? lastPase.numeroPase : null };
    }
}
