import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { ErrorDto } from '../common/dto/errorDto';
import { RxStompService } from '../common/rx-stomp.service';
import { GameUpdateBaseMessageDto } from './dto/request/message/gameUpdateMessageDto';
import { GameBaseMessageDto } from './dto/response/message/gameMessageDto';

@Injectable({
  providedIn: 'root',
})
export class WebsocketGameService {
  constructor(private rxStompService: RxStompService) {}

  public get correlateErrors() {
    return this.rxStompService.correlateErrors;
  }

  public subscribeToUpdate(friendlyId: string) {
    return this.rxStompService.watch(`/topic/game/${friendlyId}`).pipe(
      map((message) => {
        return GameBaseMessageDto.factory(JSON.parse(message.body));
      })
    );
  }

  public subscribeToUpdateError(friendlyId: string) {
    return this.rxStompService.watch(`/user/topic/game/${friendlyId}/errors`).pipe(
      map((message) => {
        const body = JSON.parse(message.body);
        return new ErrorDto(body['msg'], body['errorId'], body['fieldErrors'], body['globalErrors']);
      })
    );
  }

  public updateGame(friendlyId: string, gameUpdateMessageDto: GameUpdateBaseMessageDto) {
    this.rxStompService.publish({
      destination: `/app/game/${friendlyId}`,
      body: JSON.stringify(gameUpdateMessageDto),
    });
  }
}
