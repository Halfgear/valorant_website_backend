import { IsNotEmpty } from 'class-validator';

export class AccountDTO {
  @IsNotEmpty()
  puuid: string;

  gameName: string;

  tagLine: string;
}
