import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { NetworkService } from './network.service';
import { ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('network')
@Controller('api/network')
export class NetworkController {
  constructor(private readonly networkService: NetworkService) {}

  @Get('dns')
  @ApiQuery({ name: 'domain', required: true })
  @ApiQuery({ name: 'type', required: false })
  async dns(@Query('domain') domain: string, @Query('type') type = 'A') {
    if (!domain) throw new BadRequestException('domain is required');
    const records = await this.networkService.dnsLookup(domain, type);
    return { domain, type, records };
  }

  @Get('ssl')
  @ApiQuery({ name: 'host', required: true })
  async ssl(@Query('host') host: string) {
    if (!host) throw new BadRequestException('host is required');
    return this.networkService.sslCheck(host);
  }

  @Get('headers')
  @ApiQuery({ name: 'url', required: true })
  async headers(@Query('url') url: string) {
    if (!url) throw new BadRequestException('url is required');
    return this.networkService.httpHeaders(url);
  }

  @Get('ip')
  @ApiQuery({ name: 'ip', required: false })
  async ip(@Query('ip') ip?: string) {
    return this.networkService.ipInfo(ip);
  }

  @Get('whois')
  @ApiQuery({ name: 'domain', required: true })
  async whois(@Query('domain') domain: string) {
    if (!domain) throw new BadRequestException('domain is required');
    return this.networkService.whois(domain);
  }
}
