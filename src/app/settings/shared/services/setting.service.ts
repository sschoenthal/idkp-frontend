import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publishReplay';
import 'rxjs/add/observable/throw';

import {Message} from '@stomp/stompjs';
import {StompService} from '@stomp/ng2-stompjs';

import * as _ from 'lodash';

import {Setting} from '../models/setting.model'
import {SettingChange} from "../models/settingChange.model";
import {Pagination} from '../../../common/utils/pagination.util';
import {Pageable} from "../../../common/utils/pageable.model";

@Injectable()
export class SettingService {

  private REST_URI: string = '/idkp/setting/';

  private settings: BehaviorSubject<Setting[]> = new BehaviorSubject([]);
  private pagination: Pagination = new Pagination(0, 5, 'id');

  private webSocketSubscription: Subscription;
  private webSocketMessages: Observable<Message>;

  constructor(private http: Http, private stompService: StompService) {
    this.pagination.getNavigationObservable()
      .subscribe({
        next: (pagination: Pagination) => this.load()
      });
  }

  public getPagination(): Pagination {
    return (this.pagination);
  }

  public getSettings(): Observable<Setting[]> {
    return (this.settings.publishReplay(1).refCount());
  }

  private load(): void {
    this.http.get(this.REST_URI + this.pagination.toReqParamURIPart())
      .do(res => this.pagination.fromResponse(<Pageable>res.json()))
      .map(res => <Setting[]>res.json().content)
      .subscribe(
        p => this.settings.next(p),
        SettingService.handleError,
        this.subscribeToSettingTopic
      );
  }

  public update(id: String, name: String): void {
    this.http.post(this.REST_URI + id + '/' + name, null)
      .subscribe(res => console.log(res.status),
        SettingService.handleError,
        SettingService.handleComplete);
  }

  private static handleComplete(): void {
    console.info('Observable completed');
  }

  private static handleError(error: any): any {
    console.error('An error occurred:', error);
    return Observable.throw(error);
  }

  private subscribeToSettingTopic = (): void => {
    if (this.webSocketSubscription == null) {
      this.webSocketMessages = this.stompService.subscribe('/idkp/topic/settings');
      this.webSocketSubscription = this.webSocketMessages.subscribe(this.settingChanged);
    }
  };

  private settingChanged = (message: Message): void => {
    let settingChange: SettingChange = JSON.parse(message.body);
    switch (settingChange.changeType) {
      case "UPDATED": {
        this.updateSettingInSubject(settingChange.notifyable);
        break;
      }
    }
  };

  private updateSettingInSubject(setting: Setting): void {
    const newSettings = this.settings.getValue();
    const idx = _.findIndex(newSettings, (s: Setting) => s.id === setting.id);
    if (idx !== -1) {
      newSettings[idx] = setting;
      this.settings.next(newSettings);
    }
  }
}
