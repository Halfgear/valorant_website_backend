import { Test, TestingModule } from '@nestjs/testing';
import { PlayerSummaryService } from './player-summary.service';

describe('PlayerSummaryService', () => {
  let service: PlayerSummaryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlayerSummaryService],
    }).compile();

    service = module.get<PlayerSummaryService>(PlayerSummaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
