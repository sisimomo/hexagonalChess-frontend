import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Direction } from '../common/dto/enumeration/direction';
import { WindowDto } from '../common/dto/windowDto';
import { GameCreateDto } from './dto/request/gameCreateDto';
import { GameJoinUpdateDto } from './dto/request/gameJoinUpdateDto';
import { GameDto } from './dto/response/gameDto';

@Injectable({
  providedIn: 'root',
})
export class RestGameService {
  constructor(private httpClient: HttpClient) {}

  get(friendlyId: string) {
    return this.httpClient.get<GameDto>(`${environment.api.baseURL}/game/${friendlyId}`);
  }

  getAllLoggedInUserGames(maxResults: number, direction: Direction, cursor?: string) {
    return this.httpClient.get<WindowDto<GameDto>>(`${environment.api.baseURL}/game/logged_in_user`, {
      params: this.getParams(maxResults, direction, cursor),
    });
  }

  getAllPasswordlessGamesMissingPlayer(maxResults: number, direction: Direction, cursor?: string) {
    return this.httpClient.get<WindowDto<GameDto>>(`${environment.api.baseURL}/game/ready_to_join`, {
      params: this.getParams(maxResults, direction, cursor),
    });
  }

  joinGame(friendlyId: string, joinGameUpdateDto: GameJoinUpdateDto) {
    return this.httpClient.put<GameDto>(`${environment.api.baseURL}/game/${friendlyId}`, joinGameUpdateDto);
  }

  createGame(gameCreateDto: GameCreateDto) {
    return this.httpClient.post<GameDto>(`${environment.api.baseURL}/game`, gameCreateDto);
  }

  deleteGame(friendlyId: string) {
    return this.httpClient.delete<undefined>(`${environment.api.baseURL}/game/${friendlyId}`);
  }

  private getParams(
    maxResults: number,
    direction: Direction,
    cursor?: string
  ):
    | HttpParams
    | {
        [param: string]: string | number | boolean | readonly (string | number | boolean)[];
      }
    | undefined {
    if (cursor !== undefined) {
      return {
        cursor,
        maxResults,
        direction,
      };
    } else {
      return {
        maxResults,
        direction,
      };
    }
  }
}
