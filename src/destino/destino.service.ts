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

    async update(id: number, data: Partial<Destino>) {
        const d = await this.destinoRepository.findOneBy({ id });
        if (!d) return null;
        Object.assign(d, data);
        return this.destinoRepository.save(d);
    }

    async delete(id: number) {
        return this.destinoRepository.delete(id);
    }
}
