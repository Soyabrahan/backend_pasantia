import { Injectable, ConflictException } from '@nestjs/common';
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
        // Transactional logic would be better here
        const { equipos, ...paseData } = createPaseDto;

        try {
            // Save Pase
            const pase = (this.paseRepository.create({ ...paseData, usuarioId: userId } as any) as unknown) as Pase;
            const savedPase = await this.paseRepository.save(pase);

            // Save EquiposRelation
            if (equipos && equipos.length > 0) {
                const equiposEntities: any[] = [];
                for (const e of equipos) {
                    if (e.fmos && e.fmos.length > 0) {
                        for (const f of e.fmos) {
                            // Find existing or create
                            let equipoItem = await this.equipoRepository.findOneBy({ fmo: f });
                            if (!equipoItem) {
                                equipoItem = await this.equipoRepository.save({
                                    fmo: f,
                                    marca: e.marca ? e.marca.toLowerCase() : undefined,
                                    nombre: e.descripcion ? e.descripcion.toLowerCase() : undefined,
                                    serial: undefined
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
                            if (!equipoItem) {
                                equipoItem = await this.equipoRepository.save({
                                    fmo: undefined,
                                    marca: e.marca ? e.marca.toLowerCase() : undefined,
                                    nombre: e.descripcion ? e.descripcion.toLowerCase() : undefined,
                                    serial: s
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
                            fmo: undefined,
                            marca: e.marca ? e.marca.toLowerCase() : undefined,
                            nombre: e.descripcion ? e.descripcion.toLowerCase() : undefined,
                            serial: undefined
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
                await this.equiposPasesRepository.save(equiposEntities);
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

    findAll() {
        return this.paseRepository.find({ 
            relations: ['solicitador', 'conductor', 'autorizador', 'despachador', 'vehiculo', 'destino', 'equiposPases', 'equiposPases.equipo', 'usuario'],
            order: { id: 'DESC' }
        });
    }

    async removeAll() {
        await this.equiposPasesRepository.delete({});
        return this.paseRepository.delete({});
    }

    findOne(id: number) {
        return this.paseRepository.findOne({
            where: { id },
            relations: ['solicitador', 'conductor', 'autorizador', 'despachador', 'vehiculo', 'destino', 'equiposPases', 'equiposPases.equipo', 'usuario']
        });
    }

    update(id: number, updatePaseDto: any) {
        return this.paseRepository.update(id, updatePaseDto);
    }

    async findLastNumero() {
        const lastPase = await this.paseRepository.findOne({
            where: {},
            order: { id: 'DESC' }
        });
        return { numeroPase: lastPase ? lastPase.numeroPase : null };
    }
}
