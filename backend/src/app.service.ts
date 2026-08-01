import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      name: 'DevToolkit API',
      description: 'Programmatic access to Developer Toolkit tools and services.',
      status: 'online',
      version: '1.0.0',
      docsUrl: 'https://api.developertoolkit.online/docs',
      supportUrl: 'https://github.com/developertoolkit',
      auth: 'Authorization: Bearer dtk_...',
      note: 'API access is in early beta. Keys you generate today will continue to work as we expand the platform.',
    };
  }
}
