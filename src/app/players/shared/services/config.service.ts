import {Injectable} from '@angular/core';

import {Observable} from 'rxjs/Observable';

import {StompConfig, StompConfigService} from '@stomp/ng2-stompjs';

@Injectable()
export class ConfigService extends StompConfigService {

  constructor() {
    super();
  }

  public get(): Observable<StompConfig> {
    const conf: StompConfig = {
      url: this.getWSURL(),
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

  private getWSURL(): string {
    var loc = window.location, new_uri;
    if (loc.protocol === "https:") {
      new_uri = "wss:";
    } else {
      new_uri = "ws:";
    }
    new_uri += "//" + loc.host;
    new_uri += loc.pathname + "/players-websocket/websocket";
    return new_uri;
  }
}
