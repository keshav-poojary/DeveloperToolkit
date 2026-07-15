import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NetworkModule } from './modules/network/network.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HistoryModule } from './modules/history/history.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { User } from './modules/users/user.entity';
import { HistoryEntry } from './modules/history/history.entity';
import { ApiKey } from './modules/api-keys/api-key.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // Use Railway's volume mount path if available, otherwise use current directory
        const volumePath = process.env.RAILWAY_VOLUME_MOUNT_PATH || './data';
        const dbPath = config.get<string>('DB_PATH') || `${volumePath}/devtoolkit.sqlite`;
        return {
          type: 'sqlite',
          database: dbPath,
          entities: [User, HistoryEntry, ApiKey],
          synchronize: true,
        };
      },
    }),
    NetworkModule,
    UsersModule,
    AuthModule,
    HistoryModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
