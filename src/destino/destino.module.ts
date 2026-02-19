import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DestinoService } from './destino.service';
import { DestinoController } from './destino.controller';
import { Destino } from './entities/destino.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Destino])],
    controllers: [DestinoController],
    providers: [DestinoService],
})
export class DestinoModule { }
