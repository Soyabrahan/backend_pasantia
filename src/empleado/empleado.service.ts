import { Injectable, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empleado } from './entities/empleado.entity';
import { DepartamentoService } from '../departamento/departamento.service';

@Injectable()
export class EmpleadoService implements OnModuleInit {
    constructor(
        @InjectRepository(Empleado)
        private empleadoRepository: Repository<Empleado>,
        private departamentoService: DepartamentoService,
    ) { }

    async onModuleInit() {
        const authorizer = await this.empleadoRepository.findOne({
            where: { ficha: '15508' }
        });

        if (!authorizer) {
            let depto = await this.departamentoService.findOneByName('telemática');
            if (!depto) {
                depto = await this.departamentoService.create({ nombre: 'telemática' });
            }
            await this.empleadoRepository.save({
                ficha: '15508',
                nombre: 'carmen marquez',
                cargo: 'gerente de telemática (e)',
                departamentoId: depto.id,
                rol: 'autorizador'
            });
            console.log('Autorizador (Gerente) por defecto creado: Carmen Marquez');
        }
    }

    async findAll(): Promise<Empleado[]> {
        return this.empleadoRepository.find({ relations: ['departamento'] });
    }

    async create(empleado: Partial<Empleado>): Promise<Empleado> {
        const existing = await this.empleadoRepository.findOneBy({ ficha: empleado.ficha });
        if (existing) {
            throw new ConflictException(`La ficha ${empleado.ficha} ya pertenece al empleado: ${existing.nombre}`);
        }
        
        if (empleado.nombre) empleado.nombre = empleado.nombre.toLowerCase();
        if (empleado.cargo) empleado.cargo = empleado.cargo.toLowerCase();

        const newEmpleado = this.empleadoRepository.create(empleado);
        return this.empleadoRepository.save(newEmpleado);
    }

    async update(id: number, data: Partial<Empleado>): Promise<Empleado | null> {
        const empleado = await this.empleadoRepository.findOne({
            where: { id },
            relations: ['departamento'],
        });
        if (!empleado) return null;

        if (data.nombre) data.nombre = data.nombre.toLowerCase();
        if (data.cargo) data.cargo = data.cargo.toLowerCase();

        Object.assign(empleado, data);
        return this.empleadoRepository.save(empleado);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.empleadoRepository.softDelete(id);
        return (result.affected ?? 0) > 0;
    }
}
