import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pase } from './entities/pase.entity';
import { EquiposPases } from './entities/equipos-pases.entity';
import { Equipo } from '../equipo/entities/equipo.entity';
import { Marca } from '../marca/entities/marca.entity';
import { Empleado } from '../empleado/entities/empleado.entity';
import { Destino } from '../destino/entities/destino.entity';
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
        @InjectRepository(Empleado)
        private empleadoRepository: Repository<Empleado>,
        @InjectRepository(Destino)
        private destinoRepository: Repository<Destino>,
        private readonly auditService: AuditService,
    ) { }

    async create(createPaseDto: any, userId?: number) {
        const { equipos, ...paseData } = createPaseDto;

        try {
            if (createPaseDto.conductorId) {
                const conductor = await this.empleadoRepository.findOne({
                    where: { id: createPaseDto.conductorId },
                    relations: ['vehiculos'],
                });
                if (conductor?.vehiculos?.length) {
                    const v = conductor.vehiculos[0];
                    paseData.vehiculo_snapshot = `${v.placa}${v.marca ? ` - ${v.marca}` : ''}${v.modelo ? ` ${v.modelo}` : ''}`.trim();
                }
            }

            const pase = (this.paseRepository.create({ ...paseData, usuarioId: userId } as any) as unknown) as Pase;
            const savedPase = await this.paseRepository.save(pase);

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
                            let equipoItem = await this.equipoRepository.findOneBy({ fmo: f });
                            if (equipoItem) {
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
                            let equipoItem = await this.equipoRepository.findOneBy({ serial: s });
                            if (equipoItem) {
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

            const result = await this.findOne(savedPase.id);
            if (!result) {
                throw new Error(`Pase recién creado con ID ${savedPase.id} no encontrado`);
            }
            return result;
        } catch (error) {
            console.error('Error in PaseService create:', error);
            if (error?.message?.includes('numeroPase')) {
                throw new ConflictException('El número de pase ya existe.');
            }
            throw error;
        }
    }

    async update(id: number, updatePaseDto: any, user?: any) {
        const oldPase = await this.findOne(id);
        if (!oldPase) {
            throw new NotFoundException(`Pase con ID ${id} no encontrado`);
        }

        updatePaseDto.numeroPase = oldPase.numeroPase;
        const newPase = await this.create(updatePaseDto, user?.id);

        // Soft-delete old pase so only the latest version appears in listings
        await this.paseRepository.softDelete(oldPase.id);

        const cambios = await this.computePaseDiffWithNames(oldPase, updatePaseDto, newPase);
        const diffStr = cambios.length > 0 ? ` — Cambios: ${cambios.join('; ')}` : '';

        this.auditService.logAction({
            usuarioId: user?.id || null,
            usuarioNombre: user?.nombre || 'Desconocido',
            usuarioFicha: user?.ficha || null,
            accion: `Pase #${oldPase.numeroPase} editado (versión anterior ID ${oldPase.id} → nueva ID ${newPase.id})${diffStr}`,
            metodo: 'PATCH',
            ruta: `/pases/${id}`,
        }).catch(err => console.error('Error guardando audit log', err));

        return newPase;
    }

    private async computePaseDiffWithNames(oldPase: Pase, updateData: any, newPase?: Pase): Promise<string[]> {
        const cambios: string[] = [];

        const fields: Record<string, string> = {
            concepto: 'Concepto',
            numero_compra: 'N° Compra',
            tipo_pago: 'Tipo de Pago',
            observaciones: 'Observaciones',
            tiempo_estimado: 'Tiempo Estimado',
        };

        for (const [field, label] of Object.entries(fields)) {
            const oldVal = (oldPase as any)[field] ?? '';
            const newVal = updateData[field] ?? '';
            if (String(oldVal) !== String(newVal)) {
                cambios.push(`${label}: '${oldVal || '(vacío)'}' → '${newVal || '(vacío)'}'`);
            }
        }

        // Resolve old names from the loaded relations
        const oldNames: Record<string, string> = {
            solicitadorId: oldPase.solicitador?.nombre || String((oldPase as any).solicitadorId ?? ''),
            conductorId: oldPase.conductor?.nombre || String((oldPase as any).conductorId ?? ''),
            autorizadorId: oldPase.autorizador?.nombre || String((oldPase as any).autorizadorId ?? ''),
            despachadorId: oldPase.despachador?.nombre || String((oldPase as any).despachadorId ?? ''),
            destinoId: oldPase.destino?.nombre || String((oldPase as any).destinoId ?? ''),
        };

        // Resolve new names from the DB using the IDs in updateData
        const newNames: Record<string, string> = {};
        if (updateData.destinoId) {
            const d = await this.destinoRepository.findOneBy({ id: updateData.destinoId });
            newNames.destinoId = d?.nombre || String(updateData.destinoId);
        } else {
            newNames.destinoId = '(vacío)';
        }
        for (const role of ['solicitadorId', 'conductorId', 'autorizadorId', 'despachadorId']) {
            if (updateData[role]) {
                const emp = await this.empleadoRepository.findOneBy({ id: updateData[role] });
                newNames[role] = emp?.nombre || String(updateData[role]);
            } else {
                newNames[role] = '(vacío)';
            }
        }

        const relationLabels: Record<string, string> = {
            solicitadorId: 'Solicitador',
            conductorId: 'Conductor',
            autorizadorId: 'Autorizador',
            despachadorId: 'Despachador',
            destinoId: 'Destino',
        };

        for (const [field, label] of Object.entries(relationLabels)) {
            const oldVal = (oldPase as any)[field] ?? '';
            const newVal = updateData[field] ?? '';
            if (Number(oldVal) !== Number(newVal)) {
                cambios.push(`${label}: '${oldNames[field] || '(vacío)'}' → '${newNames[field] || '(vacío)'}'`);
            }
        }

        // Compare auto-generated snapshot fields (oldPase vs newPase)
        const snapshotFields: Record<string, string> = {
            vehiculo_snapshot: 'Vehículo',
        };
        if (newPase) {
            for (const [field, label] of Object.entries(snapshotFields)) {
                const oldVal = (oldPase as any)[field] ?? '';
                const newVal = (newPase as any)[field] ?? '';
                if (String(oldVal) !== String(newVal)) {
                    cambios.push(`${label}: '${oldVal || '(vacío)'}' → '${newVal || '(vacío)'}'`);
                }
            }
        }

        return cambios;
    }

    async findAll() {
        const all = await this.paseRepository.createQueryBuilder('pase')
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
            .leftJoinAndSelect('pase.destino', 'destino').withDeleted()
            .leftJoinAndSelect('pase.equiposPases', 'equiposPases')
            .leftJoinAndSelect('equiposPases.equipo', 'equipo')
            .leftJoinAndSelect('pase.usuario', 'usuario').withDeleted()
            .where('pase.deletedAt IS NULL')
            .orderBy('pase.id', 'DESC')
            .getMany();
        // Keep only the latest (highest ID) per numeroPase
        const seen = new Set<string>();
        return all.filter(p => {
            if (seen.has(p.numeroPase)) return false;
            seen.add(p.numeroPase);
            return true;
        });
    }

    async removeAll() {
        await this.equiposPasesRepository.delete({});
        return this.paseRepository.delete({});
    }

    findOne(id: number) {
        return this.paseRepository.createQueryBuilder('pase')
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
            .leftJoinAndSelect('pase.destino', 'destino').withDeleted()
            .leftJoinAndSelect('pase.equiposPases', 'equiposPases')
            .leftJoinAndSelect('equiposPases.equipo', 'equipo')
            .leftJoinAndSelect('pase.usuario', 'usuario').withDeleted()
            .where('pase.id = :id', { id })
            .andWhere('pase.deletedAt IS NULL')
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
