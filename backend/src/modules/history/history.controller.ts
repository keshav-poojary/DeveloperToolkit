import {
  Controller, Get, Post, Delete, Body, Param, UseGuards, Request, Query,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { HistoryService } from './history.service';

@ApiTags('history')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  @ApiOperation({ summary: 'Save a tool usage to history' })
  save(
    @Request() req: any,
    @Body() body: { toolId: string; toolName: string; input: string; output: string },
  ) {
    return this.historyService.save(
      req.user.id,
      body.toolId,
      body.toolName,
      body.input,
      body.output,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get history for the authenticated user' })
  get(@Request() req: any, @Query('limit') limit?: string) {
    return this.historyService.getForUser(req.user.id, limit ? parseInt(limit) : 50);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a history entry' })
  remove(@Param('id') id: string, @Request() req: any) {
    return this.historyService.deleteEntry(id, req.user.id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all history for authenticated user' })
  clear(@Request() req: any) {
    return this.historyService.clearUser(req.user.id);
  }
}
