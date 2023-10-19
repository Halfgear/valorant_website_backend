import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InfoService } from '../info/info.service';
import { Composition } from './entities/composition.entity';


@Injectable()
export class TournamentService {

    constructor(
        @InjectRepository(Composition)
        private readonly compositionRepository: Repository<Composition>,
        private readonly infoService: InfoService,
    ) { }
    async getCompositions() {
        const compositions = await this.compositionRepository.createQueryBuilder('composition')
            .select(['composition.id', 'composition.pickRate', 'composition.composition', 'map.mapId'])
            .leftJoin('composition.map', 'map')
            .getMany();

        const mapIds = await this.infoService.getRotationMapIds();
        const positionDict = await this.infoService.getAgentPositionsDictionary();
        const result = {};
        for (const mapId of mapIds) {
            const mapCompositions = compositions.filter(composition => composition.map?.mapId === mapId)
                .sort((a, b) => b.pickRate - a.pickRate)
                .slice(0, 3);

            for (const mapComposition of mapCompositions) {
                const curDict = {};
                const positionOutput = { "1": 0, "2": 0, "3": 0, "4": 0 };
                for (const agent of mapComposition.composition) {
                    const positionId = String(positionDict[agent]);
                    positionOutput[positionId] += 1;
                }
                curDict["position"] = positionOutput;
                curDict["AgentIds"] = mapComposition.composition;
                curDict["pickRate"] = mapComposition.pickRate;
                result[mapId] = result[mapId] || [];
                result[mapId].push(curDict);
            }
        }
        return result;
    }


    async countAgentPositions(agentList: string[]) {
        const positionDict = { "1": 0, "2": 0, "3": 0, "4": 0 };

        for (const agent of agentList) {
            const positionId = String(positionDict[agent]);
            positionDict[positionId] += 1;
        }
        return positionDict;
    }


}

