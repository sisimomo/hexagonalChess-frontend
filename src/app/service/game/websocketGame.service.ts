import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { RxStompService } from '../common/rx-stomp.service';
import { GameUpdateBaseMessageDto } from './dto/request/message/gameUpdateMessageDto';
import { GameBaseMessageDto } from './dto/response/message/gameMessageDto';

@Injectable({
  providedIn: 'root',
})
export class WebsocketGameService {
  constructor(private rxStompService: RxStompService) {}

  subscribeToUpdate(friendlyId: string) {
    return this.rxStompService.watch(`/topic/game/${friendlyId}`).pipe(
      map((message) => {
        return GameBaseMessageDto.factory(JSON.parse(message.body));
      })
    );
  }

  updateGame(friendlyId: string, gameUpdateMessageDto: GameUpdateBaseMessageDto) {
    this.rxStompService.publish({
      destination: `/app/game/${friendlyId}`,
      body: JSON.stringify(gameUpdateMessageDto),
    });
  }
}
