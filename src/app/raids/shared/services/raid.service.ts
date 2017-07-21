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

import {Raid} from '../models/raid.model'
import {RaidChange} from "../models/raidChange.model";
import {Pagination} from '../../../common/utils/pagination.util';
import {Pageable} from "../../../common/utils/pageable.model";
import {Subject} from "rxjs/Subject";

@Injectable()
export class RaidService {

  private REST_URI: string = '/idkp/raid/';

  private paginatedRaids: BehaviorSubject<Raid[]> = new BehaviorSubject([]);

  private resolvedRaids: Raid[] = [];

  private pagination: Pagination = new Pagination(0, 5, 'name');

  private webSocketSubscription: Subscription;
  private webSocketMessages: Observable<Message>;

  constructor(private http: Http, private stompService: StompService) {
    this.pagination.getNavigationObservable()
      .subscribe({
        next: (pagination: Pagination) => this.load()
      });
  }

  public getPagination(): Pagination {
    return this.pagination;
  }

  public getRaids(): Observable<Raid[]> {
    return this.paginatedRaids.publishReplay(1).refCount();
  }

  public getRaid(id:number): Observable<Raid> {
    let idx = _.findIndex(this.resolvedRaids, (r: Raid) => r.id === id);
    if (idx !== -1) {
      return(Observable.of(this.resolvedRaids[idx]).publishReplay(1).refCount());
    } else {
      let raidSubject:Subject<Raid> = new Subject();
      this.http.get(this.REST_URI + id)
        .map(res => <Raid>res.json().content)
        .subscribe(
          raid => raidSubject.next(raid),
          RaidService.handleError,
          RaidService.handleComplete
        );
      raidSubject.subscribe(
        raid => this.resolveRaid(raid)
      );
      return(raidSubject.asObservable());
    }
  }

  public resolveRaid(raid:Raid): Raid {
    let idx = _.findIndex(this.resolvedRaids, (r: Raid) => r.id === raid.id);
    if (idx !== -1) {
      this.resolvedRaids[idx].name = raid.name;
      return this.resolvedRaids[idx];
    } else {
      this.resolvedRaids.push(raid);
      return raid;
    }
  }

  private resolveRaids(raids: Raid[]): Raid[] {
    let resolvedRaids: Raid[] = [];
    raids.forEach(raid => {
      resolvedRaids.push(this.resolveRaid(raid));
    });
    return resolvedRaids;
  }

  private load(): void {
    this.http.get(this.REST_URI + this.pagination.toReqParamURIPart())
      .do(res => this.pagination.fromResponse(<Pageable>res.json()))
      .map(res => <Raid[]>res.json().content)
      .subscribe(
        p => this.paginatedRaids.next(this.resolveRaids(p)),
        RaidService.handleError,
        this.subscribeToRaidTopic
      );
  }

  public delete(id: number): void {
    this.http.delete(this.REST_URI + id)
      .subscribe(res => console.log(res.status),
        RaidService.handleError,
        RaidService.handleComplete);
  }

  public update(id: number, name: String): void {
    this.http.post(this.REST_URI + id + '/' + name, null)
      .subscribe(res => console.log(res.status),
        RaidService.handleError,
        RaidService.handleComplete);
  }

  public create(name: String): void {
    this.http.put(this.REST_URI + name, null)
      .subscribe(res => console.log(res.status),
        RaidService.handleError,
        RaidService.handleComplete);
  }

  private static handleComplete(): void {
    console.info('Observable completed');
  }

  private static handleError(error: any): any {
    console.error('An error occurred:', error);
    return Observable.throw(error);
  }

  private subscribeToRaidTopic = (): void => {
    if (this.webSocketSubscription == null) {
      this.webSocketMessages = this.stompService.subscribe('/idkp/topic/raids');
      this.webSocketSubscription = this.webSocketMessages.subscribe(this.raidChanged);
    }
  };

  private raidChanged = (message: Message): void => {
    let raidChange: RaidChange = JSON.parse(message.body);
    switch (raidChange.changeType) {
      case "CREATED": {
        this.addRaidToSubject(raidChange.notifyable);
        break;
      }
      case "UPDATED": {
        this.updateRaidInSubject(raidChange.notifyable);
        break;
      }
      case "REMOVED": {
        this.removeRaidFromSubject(raidChange.notifyable);
        break;
      }
    }
  };

  private removeRaidFromSubject(raid: Raid): void {
    let newRaids = this.paginatedRaids.getValue();
    _.remove(newRaids, (p: Raid) => p.id === raid.id);
    this.paginatedRaids.next(newRaids);
  }

  private addRaidToSubject(raid: Raid): void {
    let newRaids = this.paginatedRaids.getValue();
    newRaids.push(raid);
    this.paginatedRaids.next(newRaids);
    let idx = _.findIndex(this.resolvedRaids, (r: Raid) => r.id === raid.id);
    if (idx !== -1) {
      this.resolvedRaids[idx].name = raid.name;
    } else {
      this.resolvedRaids.push(raid);
    }
  }

  private updateRaidInSubject(raid: Raid): void {
    let newRaids = this.paginatedRaids.getValue();
    let idx = _.findIndex(newRaids, (r: Raid) => r.id === raid.id);
    if (idx !== -1) {
      newRaids[idx] = raid;
      this.paginatedRaids.next(newRaids);
    }
    idx = _.findIndex(this.resolvedRaids, (r: Raid) => r.id === raid.id);
    if (idx !== -1) {
      this.resolvedRaids[idx].name = raid.name;
    }
  }
}
