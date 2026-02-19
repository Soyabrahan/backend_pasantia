import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipo } from './entities/equipo.entity';

@Injectable()
export class EquipoService {
    constructor(
        @InjectRepository(Equipo)
        private equipoRepository: Repository<Equipo>,
    ) { }

    create(createEquipoDto: Partial<Equipo>) {
        return this.equipoRepository.save(createEquipoDto);
    }

    findAll() {
        return this.equipoRepository.find();
    }
}
