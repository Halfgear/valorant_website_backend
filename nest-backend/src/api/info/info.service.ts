import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DifficultyService } from '../difficulty/difficulty.service';
import { AgentInfo } from './entities/agent.info.entity';
import { MapInfo } from './entities/map.info.entity';
import { SprayInfo } from './entities/spray.info.entity';
import { WeaponInfo } from './entities/weapon.info.entity';

@Injectable()
export class InfoService {

  constructor(
    @InjectRepository(AgentInfo)
    private readonly agentInfoRepository: Repository<AgentInfo>,
    @InjectRepository(AgentInfo)
    private readonly sprayInfoRepository: Repository<SprayInfo>,
    @InjectRepository(AgentInfo)
    private readonly weaponInfoRepository: Repository<WeaponInfo>,
    @InjectRepository(MapInfo)
    private readonly mapInfoRepository: Repository<MapInfo>,

    private readonly difficultyService: DifficultyService,
  ) { }

  async getAgentId() {
    const ret = await this.agentInfoRepository.find({
      select: {
        agentId: true,
        nameUs: true,
        nameKr: true,
      },
    });
    return ret
  }

  async getPositionId() {
    const ret = await this.agentInfoRepository.find({
      select: {
        agentId: true,
        positionId: true
      },
    });
    return ret
  }


  async getAgentName() {
    const ret = await this.agentInfoRepository.find();
    return ret;
  }


  async getAgentPositionsId() {
    const ret = await this.agentInfoRepository.find({
      select: {
        agentId: true,
        positionId: true,
      },
    });
    return ret;
  }

  async getAgentPositionsDictionary() {
    const ids = await this.getAgentPositionsId();
    const ret = {};
    for (const id of ids) {
      ret[id.agentId] = id.positionId;
    }
    return ret;
  }

  async getMapIdDictionary() {
    const ids = await this.mapInfoRepository.find({
      select: {
        mapId: true,
        nameUs: true,
      },
    });
    const ret = {}
    for (const id of ids) {
      ret[id.mapId] = id.nameUs;
    }
    return ret
  }

  async getRotationMapIds(): Promise<string[]> {
    const rotationMapIds = await this.mapInfoRepository.find({
      where: {
        isRotation: true,
      },
      select: {
        mapId: true,
        id: true
      },
    });
    return rotationMapIds.map(mapInfo => mapInfo.mapId);
  }

  async getMapsInRotation(): Promise<MapInfo[]> {
    return this.mapInfoRepository.createQueryBuilder('mapInfo')
      .select(['mapInfo.mapId', 'mapInfo.id', 'mapInfo.nameKr', 'mapInfo.nameUs'])
      .where('mapInfo.isRotation = :isRotation', { isRotation: true })
      .getMany();
  }

  async getAllMaps(): Promise<MapInfo[]> {
    return this.mapInfoRepository.createQueryBuilder('mapInfo')
      .select(['mapInfo.mapId', 'mapInfo.id', 'mapInfo.nameKr', 'mapInfo.nameUs'])
      .getMany();
  }

  async getAllDifficulty() {
    const agentInfoList = await this.agentInfoRepository.find({
      select: {
        agentId: true,
        nameUs: true,
        nameKr: true,
      },
    });
    const difficulties = await this.difficultyService.getDifficultyDictionary();

    const result = agentInfoList.map(({ agentId, ...rest }) => {
      return {
        ...rest,
        difficulty: difficulties[agentId] || 'Not available'
      };
    });

    return result
  }
}
