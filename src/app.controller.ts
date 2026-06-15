import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('general')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Mensaje de bienvenida o estado de la API' })
  @ApiResponse({ status: 200, description: 'Mensaje obtenido correctamente.', type: String })
  getHello(): string {
    return this.appService.getHello();
  }
}

