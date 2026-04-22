import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';

@Injectable()
export class VehiculoService {
    constructor(
        @InjectRepository(Vehiculo)
        private vehiculoRepository: Repository<Vehiculo>,
    ) { }

    async create(createVehiculoDto: Partial<Vehiculo>) {
        const { conductores, ...rest } = createVehiculoDto;
        
        // Normalizar a minúsculas
        if (rest.marca) rest.marca = rest.marca.toLowerCase();
        if (rest.modelo) rest.modelo = rest.modelo.toLowerCase();
        if (rest.placa) rest.placa = rest.placa.toLowerCase();
        if (rest.fmo) rest.fmo = rest.fmo.toLowerCase();

        const saved = await this.vehiculoRepository.save(rest);
        
        if (conductores && conductores.length > 0) {
            // Verificar si alguno de los conductores ya tiene un vehículo asignado
            for (const c of conductores) {
                const existingAssignment = await this.vehiculoRepository.findOne({
                    where: { conductores: { id: c.id } }
                });
                if (existingAssignment) {
                    throw new ConflictException(`El conductor con ID ${c.id} ya tiene el vehículo ${existingAssignment.placa} asignado.`);
                }
            }

            const v = await this.vehiculoRepository.findOne({ where: { id: saved.id }, relations: ['conductores'] });
            if (v) {
                v.conductores = conductores;
                await this.vehiculoRepository.save(v);
            }
        }
        return this.findOneComplete(saved.id);
    }

    findAll() {
        return this.vehiculoRepository.find({ relations: ['conductores'] });
    }

    private findOneComplete(id: number) {
        return this.vehiculoRepository.findOne({
            where: { id },
            relations: ['conductores']
        });
    }

    async update(id: number, vehiculoData: Partial<Vehiculo>) {
        const { conductores, id: _id, ...rest } = vehiculoData as any;
        delete rest.conductorId;
        
        // Normalizar a minúsculas
        if (rest.marca) rest.marca = rest.marca.toLowerCase();
        if (rest.modelo) rest.modelo = rest.modelo.toLowerCase();
        if (rest.placa) rest.placa = rest.placa.toLowerCase();
        if (rest.fmo) rest.fmo = rest.fmo.toLowerCase();

        const v = await this.vehiculoRepository.findOne({ where: { id }, relations: ['conductores'] });
        if (!v) return null;

        // Actualizamos los campos básicos
        Object.assign(v, rest);

        // Si hay conductores, actualizamos la relación
        if (conductores) {
            // Verificar si alguno de los conductores ya tiene otro vehículo asignado
            for (const c of conductores) {
                const existingAssignment = await this.vehiculoRepository.findOne({
                    where: { 
                        id: Not(id), // Ignorar el vehículo actual
                        conductores: { id: c.id } 
                    }
                });
                if (existingAssignment) {
                    throw new ConflictException(`El conductor ya tiene el vehículo ${existingAssignment.placa} asignado.`);
                }
            }
            v.conductores = conductores;
        }
        
        await this.vehiculoRepository.save(v);
        
        return this.findOneComplete(id);
    }
    async delete(id: number) {
        return await this.vehiculoRepository.softDelete(id);
    }
}
