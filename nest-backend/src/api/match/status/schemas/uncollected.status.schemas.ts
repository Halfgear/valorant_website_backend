import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UncollectedMatchStatusDocument = UncollectedMatchStatus & Document;
@Schema({ collection: 'uncollected_match_ids' })
export class UncollectedMatchStatus {
  @Prop()
  _id: string;
}

export const UncollectedMatchStatusSchema =
  SchemaFactory.createForClass(UncollectedMatchStatus);