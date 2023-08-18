import { Injectable } from '@angular/core';
import { RxStomp } from '@stomp/rx-stomp';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RxStompService extends RxStomp {
  constructor(keycloak: KeycloakService) {
    super();
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
}
