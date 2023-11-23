import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable } from '@nestjs/common';
import { catchError, lastValueFrom, timer } from 'rxjs';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AccountDTO } from './dto/account.dto';
import { MatchesByPuuidDTO } from './dto/match.dto';



@Injectable()
export class RiotService {
    constructor(private httpService: HttpService) { }


    async getRequestToRiotAPI(
        url: string,
        retryCount: number,
        dtoClass?: ClassConstructor<any>,
      ): Promise<any> {
        const response$ = this.httpService
          .get(url, {
            validateStatus: (status) => {
              return status === 200 || status === 429;
            },
          })
          .pipe(
            catchError((error) => {
              throw new HttpException(error, error.status);
            }),
          );
        const response = await lastValueFrom(response$);
        if (response.status === 200) {
          if (!dtoClass) {
            return response.data;
          }
          const data = plainToClass(dtoClass, response.data);
          const errors = await validate(data);
          if (errors.length > 0) {
            throw new TypeError(
              `validation failed. The error fields : ${errors.map(
                ({ property }) => property,
              )}`,
            );
          }
          return data;
        } else if (response.status === 429 && retryCount > 0) {
          const retryAfter = response.headers['retry-after'];
          await lastValueFrom(timer(parseInt(retryAfter)));
          return this.getRequestToRiotAPI(url, retryCount - 1, dtoClass);
        }
        throw new HttpException(response.data, response.status);
      }


      async getAccountByNameTag(name: string, tag: string): Promise<AccountDTO> {
        const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURI(name)}/${encodeURI(tag)}/`;
        const output = await this.getRequestToRiotAPI(url, 3, AccountDTO);
        console.log(output);
        return output
      }

      async getAccountByPuuid(puuid: string): Promise<AccountDTO> {
        const url = `https://asia.api.riotgames.com/riot/account/v1/accounts/by-puuid/${encodeURI(puuid)}/`;
        return await this.getRequestToRiotAPI(url, 3, AccountDTO);
      }
    
    
      async getMatchesByPuuid (puuid: string) : Promise<MatchesByPuuidDTO> {
        const url = `https://kr.api.riotgames.com/val/match/v1/matchlists/by-puuid/${encodeURI(puuid)}/`;
        return await this.getRequestToRiotAPI(url, 3, MatchesByPuuidDTO);
      }
    
    
}
