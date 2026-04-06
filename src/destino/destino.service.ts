import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Destino } from './entities/destino.entity';

@Injectable()
export class DestinoService {
    constructor(
        @InjectRepository(Destino)
        private destinoRepository: Repository<Destino>,
    ) { }

    create(createDestinoDto: Partial<Destino>) {
        return this.destinoRepository.save(createDestinoDto);
    }

    findAll() {
        return this.destinoRepository.find();
    }

    update(id: number, data: Partial<Destino>) {
        return this.destinoRepository.update(id, data);
    }

    async delete(id: number) {
        return this.destinoRepository.delete(id);
    }
}
