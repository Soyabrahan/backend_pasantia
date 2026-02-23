import { Injectable } from '@nestjs/common';
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
        const newEmpleado = this.empleadoRepository.create(empleado);
        return this.empleadoRepository.save(newEmpleado);
    }

    async update(id: number, data: Partial<Empleado>): Promise<Empleado | null> {
        const empleado = await this.empleadoRepository.findOneBy({ id });
        if (!empleado) return null;
        Object.assign(empleado, data);
        return this.empleadoRepository.save(empleado);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.empleadoRepository.delete(id);
        return (result.affected ?? 0) > 0;
    }
}
