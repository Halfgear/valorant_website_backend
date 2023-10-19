import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { PlayerSearchOutput } from './types/player.type';

@Controller('search')
export class SearchController {
    constructor(private readonly searchService: SearchService) {}

    /**
     * 검색기능 자동완성 기능입니다.
     * @param name 플레이어의 이름 앞부분
     * @returns 이름 앞부분이 일치하는 최대 다섯명의 플레이어 리스트
     */
    @Get('playersAutoComplete')
    async getPlayersAutoComplete(@Query('name') name: string): Promise<PlayerSearchOutput[]> {
        return this.searchService.getPlayersAutoComplete(name);
    }

}
