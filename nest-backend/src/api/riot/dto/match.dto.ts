import { Type } from "class-transformer";
import { IsArray, IsNotEmpty, ValidateNested } from "class-validator";

export class Match {
    @IsNotEmpty()
    matchId: string;
  
    gameStartTimeMillis: number;
  
    queueId: string;
  }
  
  export class MatchesByPuuidDTO {
    @IsNotEmpty()
    puuid: string;
  
    @IsArray()
    @ValidateNested({ each: true })
    history: Match[];
  }
