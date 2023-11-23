import { Controller, Get } from '@nestjs/common';
import { InfoService } from './info.service';

@Controller('info')
export class InfoController {
    constructor(private readonly InfoService: InfoService) {}

    @Get('agentId')
    async getAgentId() {
        const result = await this.InfoService.getAgentId();
        return result;
    }

    @Get('positionId')
    async getPositionId() {
        const result = await this.InfoService.getPositionId();
        return result;
    }

    @Get('rotationMapId')
    async getMapIdInRotation() {
        const result = await this.InfoService.getMapsInRotation();
        return result;
    }

    @Get('mapId')
    async getAllMapId() {
        const result = await this.InfoService.getAllMaps();
        return result;
    }

    @Get('difficulty')
    async getAllDifficulty() {
        const result = await this.InfoService.getAllDifficulty();
        return result;
    }
}

