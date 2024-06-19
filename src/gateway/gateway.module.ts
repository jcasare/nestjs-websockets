import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { ConfigModule } from '@nestjs/config';

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
