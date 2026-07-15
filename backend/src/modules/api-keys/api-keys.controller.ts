import {
  Controller, Get, Post, Delete, Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ApiKeysService } from './api-keys.service';

@ApiTags('api-keys')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a new API key' })
  create(@Request() req: any, @Body() body: { label?: string }) {
    return this.apiKeysService.create(req.user.id, body.label);
  }

  @Get()
  @ApiOperation({ summary: 'List your API keys' })
  list(@Request() req: any) {
    return this.apiKeysService.listForUser(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an API key' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.apiKeysService.delete(id, req.user.id);
  }
}
