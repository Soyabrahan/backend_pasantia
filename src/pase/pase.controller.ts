import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { PaseService } from './pase.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('pases')
export class PaseController {
    constructor(private readonly paseService: PaseService) { }

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createPaseDto: any) {
        return this.paseService.create(createPaseDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.paseService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.paseService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePaseDto: any) {
        return this.paseService.update(+id, updatePaseDto);
    }
}
