import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchStatus, MatchStatusDocument } from './schemas/status.schema';
import { UncollectedMatchStatus, UncollectedMatchStatusDocument } from './schemas/uncollected.status.schemas';

@Injectable()
export class MatchStatusService {
    constructor(
        @InjectModel(UncollectedMatchStatus.name, 'match_info')
        private uncollectedmatchStatusModel: Model<UncollectedMatchStatusDocument>,

        @InjectModel(MatchStatus.name, 'match_info')
        private matchStatusModel: Model<MatchStatusDocument>,
    ) { }

    async undateMatchStatusToNotCollected(matchId: string): Promise<void> {
        // Check if the matchId has already been crawled
        const item = await this.matchStatusModel.findOne({ _id: matchId });
        // If not in the database, add to the uncollectedmatchStatusModel
        if (!item) {
            console.log(`inserted ${matchId}`)
            await this.uncollectedmatchStatusModel.updateOne(
                { _id: matchId },
                { $setOnInsert: { _id: matchId } },
                { upsert: true }
            );
        }
    }
    
}
