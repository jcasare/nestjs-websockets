import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { RedisModule } from '@nestjs-modules/ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './.env',
    }),
  ],
  providers: [MyGateway],
})
export class GatewayModule {}
