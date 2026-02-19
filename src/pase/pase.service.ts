import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pase } from './entities/pase.entity';
import { EquiposPases } from './entities/equipos-pases.entity';

@Injectable()
export class PaseService {
    constructor(
        @InjectRepository(Pase)
        private paseRepository: Repository<Pase>,
        @InjectRepository(EquiposPases)
        private equiposPasesRepository: Repository<EquiposPases>,
    ) { }

    async create(createPaseDto: any) {
        // Transactional logic would be better here
        const { equipos, ...paseData } = createPaseDto;

        // Save Pase
        const pase = (this.paseRepository.create(paseData as any) as unknown) as Pase;
        const savedPase = await this.paseRepository.save(pase);

        // Save EquiposRelation
        if (equipos && equipos.length > 0) {
            const equiposEntities = equipos.map(e => ({
                paseId: savedPase.id,
                equipoId: e.equipoId,
                cantidad: e.cantidad
            }));
            await this.equiposPasesRepository.save(equiposEntities);
        }

        return this.findOne(savedPase.id);
    }

    findAll() {
        return this.paseRepository.find({ relations: ['solicitador', 'vehiculo', 'destino'] });
    }

    findOne(id: number) {
        return this.paseRepository.findOne({
            where: { id },
            relations: ['solicitador', 'conductor', 'autorizador', 'despachador', 'vehiculo', 'destino', 'equiposPases', 'equiposPases.equipo']
        });
    }

    update(id: number, updatePaseDto: any) {
        return this.paseRepository.update(id, updatePaseDto);
    }
}
