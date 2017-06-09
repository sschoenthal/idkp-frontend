import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import {StompConfig, StompConfigService} from '@stomp/ng2-stompjs';

@Injectable()
export class ConfigService extends StompConfigService {

  constructor() {
    super();
  }

  public get(): Observable<StompConfig> {
    const conf: StompConfig = {
      url: "ws://127.0.0.1:8084/idkp/players-websocket/websocket",
      headers: {
        login: "guest",
        passcode: "guest"
      },
      heartbeat_in: 0,
      heartbeat_out: 20000,
      reconnect_delay: 5000,
      debug: true
    };
    return Observable.of(conf);
  }
}
