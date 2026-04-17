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
        if (createDestinoDto.nombre) createDestinoDto.nombre = createDestinoDto.nombre.toLowerCase();
        if (createDestinoDto.direccion) createDestinoDto.direccion = createDestinoDto.direccion.toLowerCase();
        return this.destinoRepository.save(createDestinoDto);
    }

    findAll() {
        return this.destinoRepository.find();
    }

    async update(id: number, data: Partial<Destino>) {
        const d = await this.destinoRepository.findOneBy({ id });
        if (!d) return null;
        
        if (data.nombre) data.nombre = data.nombre.toLowerCase();
        if (data.direccion) data.direccion = data.direccion.toLowerCase();

        Object.assign(d, data);
        return this.destinoRepository.save(d);
    }

    async delete(id: number) {
        return this.destinoRepository.delete(id);
    }
}
