import { Injectable } from '@angular/core';
import { IFrame, RxStomp } from '@stomp/rx-stomp';
import { KeycloakService } from 'keycloak-angular';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RxStompService extends RxStomp {
  private innerCorrelateErrors: Observable<IFrame>;

  constructor(keycloak: KeycloakService) {
    super();
    this.innerCorrelateErrors = new Observable((subscriber) => {
      this.configure({
        correlateErrors: (error: IFrame) => {
          subscriber.next(error);
          return '';
        },
      });
    });
    this.configure({
      beforeConnect: async (client) => {
        const token = await keycloak.getToken();
        client.configure({
          brokerURL:
            environment.api.baseURL.replace('http', 'ws') +
            '/ws' +
            (token !== undefined ? '?access_token=' + token : ''),
        });
      },
      debug: (str) => {
        if (!environment.prod) {
          console.debug(new Date(), str);
        }
      },
    });
    this.activate();
  }

  public get correlateErrors() {
    return this.innerCorrelateErrors;
  }
}
