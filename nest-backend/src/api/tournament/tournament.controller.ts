import { Controller, Get, Query } from '@nestjs/common';
import { TournamentService } from './tournament.service';

@Controller('tournament')
export class TournamentController {
    
    constructor(private readonly tournamentService: TournamentService) {}

    @Get('tournamentStats')
    async getTopCompositions() {
        return this.tournamentService.getCompositions();
    }
}