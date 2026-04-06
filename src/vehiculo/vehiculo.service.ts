import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehiculo } from './entities/vehiculo.entity';

@Injectable()
export class VehiculoService {
    constructor(
        @InjectRepository(Vehiculo)
        private vehiculoRepository: Repository<Vehiculo>,
    ) { }

    create(createVehiculoDto: Partial<Vehiculo>) {
        return this.vehiculoRepository.save(createVehiculoDto);
    }

    findAll() {
        return this.vehiculoRepository.find();
    }
    update(id: number, vehiculo: Partial<Vehiculo>) {
        return this.vehiculoRepository.update(id, vehiculo);
    }
    delete(id: number) {
        return this.vehiculoRepository.delete(id);
    }
}
