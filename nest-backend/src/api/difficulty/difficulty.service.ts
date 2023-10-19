import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Difficulty } from './entity/difficulty.entity';

@Injectable()
export class DifficultyService {
    constructor(
        @InjectRepository(Difficulty)
        private readonly difficultyRepository: Repository<Difficulty>,
    ) { }

    async getDifficultyDictionary(): Promise<any> {
        const agentDifficulties = await this.difficultyRepository.find();
        const result: { [key: string]: any } = {};
        for (const agent of agentDifficulties) {
            result[agent.agentId] = agent.difficulty;
        }
        return result
    }
}
