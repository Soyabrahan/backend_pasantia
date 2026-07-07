import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Departamento } from './entities/departamento.entity';

@Injectable()
export class DepartamentoService {
    constructor(
        @InjectRepository(Departamento)
        private departamentoRepository: Repository<Departamento>,
    ) { }

    async create(data: Partial<Departamento>) {
        const existing = await this.departamentoRepository.findOneBy({ nombre: data.nombre?.toLowerCase() });
        if (existing) {
            throw new ConflictException(`El departamento "${data.nombre}" ya existe`);
        }
        if (data.nombre) data.nombre = data.nombre.toLowerCase();
        return this.departamentoRepository.save(data);
    }

    findAll() {
        return this.departamentoRepository.find();
    }

    findOne(id: number) {
        return this.departamentoRepository.findOneBy({ id });
    }

    findOneByName(nombre: string) {
        return this.departamentoRepository.findOneBy({ nombre: nombre.toLowerCase() });
    }

    async update(id: number, data: Partial<Departamento>) {
        const d = await this.departamentoRepository.findOneBy({ id });
        if (!d) return null;
        if (data.nombre) data.nombre = data.nombre.toLowerCase();
        Object.assign(d, data);
        return this.departamentoRepository.save(d);
    }

    async remove(id: number) {
        return this.departamentoRepository.softDelete(id);
    }
}
