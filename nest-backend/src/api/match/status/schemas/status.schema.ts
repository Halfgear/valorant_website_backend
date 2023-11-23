import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MatchStatusDocument = MatchStatus & Document;

@Schema({ collection: 'match_ids' })
export class MatchStatus {
  @Prop()
  _id: string;

  @Prop()
  is_complete: string;

  @Prop()
  player_summary: string;

  @Prop()
  stat_count: string;

  @Prop()
  queue_id: string;

  @Prop()
  season_id: string;
}

export const MatchStatusSchema =
  SchemaFactory.createForClass(MatchStatus);