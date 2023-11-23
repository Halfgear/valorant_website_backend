import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RiotService } from './riot.service';

@Module({
  providers: [RiotService],
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get('REGION') === 'kr' ? 2000 : 5000,
        maxRedirects: 3,
        headers: {
          'X-Riot-Token': configService.get<string>('RIOT_API_KEY'),
        },
      }),
      inject: [ConfigService],
    }),

  ],
  exports: [RiotService]

})
export class RiotModule {
}
