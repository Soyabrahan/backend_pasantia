import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Marca } from './entities/marca.entity';

@Injectable()
export class MarcaService {
    constructor(
        @InjectRepository(Marca)
        private marcaRepository: Repository<Marca>,
    ) {}

    findAll() {
        return this.marcaRepository.find({ order: { nombre: 'ASC' } });
    }

    create(data: Partial<Marca>) {
        return this.marcaRepository.save(data);
    }

    async update(id: number, data: Partial<Marca>) {
        await this.marcaRepository.update(id, data);
        return this.marcaRepository.findOneBy({ id });
    }

    async delete(id: number) {
        return this.marcaRepository.delete(id);
    }
}
