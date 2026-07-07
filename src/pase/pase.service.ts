import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pase } from './entities/pase.entity';
import { EquiposPases } from './entities/equipos-pases.entity';
import { Equipo } from '../equipo/entities/equipo.entity';

@Injectable()
export class PaseService {
    constructor(
        @InjectRepository(Pase)
        private paseRepository: Repository<Pase>,
        @InjectRepository(EquiposPases)
        private equiposPasesRepository: Repository<EquiposPases>,
        @InjectRepository(Equipo)
        private equipoRepository: Repository<Equipo>,
    ) { }

    async create(createPaseDto: any, userId?: number) {
        const { equipos, solicitud, vehiculoId, ...paseData } = createPaseDto;

        try {
            // Save Pase
            const pase = (this.paseRepository.create({ ...paseData, usuarioId: userId } as any) as unknown) as Pase;
            const savedPase = await this.paseRepository.save(pase);

            // Save EquiposRelation
            if (equipos && equipos.length > 0) {
                const equiposEntities: any[] = [];
                for (const e of equipos) {
                    const brand = e.marca ? e.marca.toLowerCase() : undefined;
                    const name = e.descripcion ? e.descripcion.toLowerCase() : undefined;

                    if (e.fmos && e.fmos.length > 0) {
                        for (const f of e.fmos) {
                            // Find existing or create
                            let equipoItem = await this.equipoRepository.findOneBy({ fmo: f });
                            if (equipoItem) {
                                // Update existing equipment attributes
                                equipoItem.marca = brand;
                                equipoItem.nombre = name;
                                equipoItem = await this.equipoRepository.save(equipoItem);
                            } else {
                                equipoItem = await this.equipoRepository.save({
                                    fmo: f,
                                    marca: brand,
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
                                equipoItem.marca = brand;
                                equipoItem.nombre = name;
                                equipoItem = await this.equipoRepository.save(equipoItem);
                            } else {
                                equipoItem = await this.equipoRepository.save({
                                    serial: s,
                                    marca: brand,
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
                            marca: brand,
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

    async update(id: number, updatePaseDto: any, userId: number) {
        const existingPase = await this.paseRepository.findOneBy({ id });
        if (!existingPase) {
            throw new NotFoundException(`Pase con ID ${id} no encontrado`);
        }

        await this.paseRepository.softDelete(id);
        await this.equiposPasesRepository.softDelete({ paseId: id });

        return this.create(updatePaseDto, userId);
    }

    findAll() {
        return this.paseRepository.createQueryBuilder('pase')
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
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
            .leftJoinAndSelect('pase.solicitador', 'solicitador').withDeleted()
            .leftJoinAndSelect('pase.conductor', 'conductor').withDeleted()
            .leftJoinAndSelect('pase.autorizador', 'autorizador').withDeleted()
            .leftJoinAndSelect('pase.despachador', 'despachador').withDeleted()
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
