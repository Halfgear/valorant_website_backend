import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRso } from './entity/rso.entity';

@Injectable()
export class RsoService {
    constructor(
        @InjectRepository(UserRso)
        private readonly userRsoRepository: Repository<UserRso>
    ) { }

    async checkIfRso(playerId: string): Promise<boolean> {
        const userRso = await this.userRsoRepository.findOne({
            where: {
                playerId: playerId,
            },
            select: {
                isRSOed: true,
            }
        })

        if (!userRso) {
            return false
        }

        return userRso.isRSOed
    }


    async updateRsoStatus(playerId: string, isRSOed: boolean): Promise<UserRso> {
        let userRso = await this.userRsoRepository.findOne({
            where: {
                playerId: playerId
            }
        });

        if (!userRso) {
            userRso = this.userRsoRepository.create({
                playerId, isRSOed
            });
        } else {
            userRso.isRSOed = isRSOed;
        }

        return await this.userRsoRepository.save(userRso);
    }
}
