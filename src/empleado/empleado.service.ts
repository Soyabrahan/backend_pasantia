import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';

@Injectable()
export class EmpleadoService {
    constructor(
        @InjectRepository(Empleado)
        private empleadoRepository: Repository<Empleado>,
    ) { }

    async findAll(): Promise<Empleado[]> {
        return this.empleadoRepository.find();
    }

    async create(empleado: Partial<Empleado>): Promise<Empleado> {
        const existing = await this.empleadoRepository.findOneBy({ ficha: empleado.ficha });
        if (existing) {
            throw new ConflictException(`La ficha ${empleado.ficha} ya pertenece al empleado: ${existing.nombre}`);
        }
        
        // Normalizar a minúsculas
        if (empleado.nombre) empleado.nombre = empleado.nombre.toLowerCase();
        if (empleado.cargo) empleado.cargo = empleado.cargo.toLowerCase();
        if (empleado.departamento) empleado.departamento = empleado.departamento.toLowerCase();

        const newEmpleado = this.empleadoRepository.create(empleado);
        return this.empleadoRepository.save(newEmpleado);
    }

    async update(id: number, data: Partial<Empleado>): Promise<Empleado | null> {
        const empleado = await this.empleadoRepository.findOneBy({ id });
        if (!empleado) return null;

        // Normalizar a minúsculas
        if (data.nombre) data.nombre = data.nombre.toLowerCase();
        if (data.cargo) data.cargo = data.cargo.toLowerCase();
        if (data.departamento) data.departamento = data.departamento.toLowerCase();

        Object.assign(empleado, data);
        return this.empleadoRepository.save(empleado);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.empleadoRepository.softDelete(id);
        return (result.affected ?? 0) > 0;
    }
}
