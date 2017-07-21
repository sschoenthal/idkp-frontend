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

import {Event} from '../models/event.model'
import {EventChange} from "../models/eventChange.model";
import {Pagination} from '../../../common/utils/pagination.util';
import {Pageable} from "../../../common/utils/pageable.model";

import {RaidService} from "../../../raids/shared/services/raid.service";

@Injectable()
export class EventService {

  private REST_URI: string = '/idkp/event/';

  private events: BehaviorSubject<Event[]> = new BehaviorSubject([]);
  private pagination: Pagination = new Pagination(0, 5, 'date');

  private webSocketSubscription: Subscription;
  private webSocketMessages: Observable<Message>;

  constructor(private http: Http,
              private stompService: StompService,
              private raidService: RaidService) {
    this.pagination.getNavigationObservable()
      .subscribe({
        next: (pagination: Pagination) => this.load()
      });
  }

  public getPagination(): Pagination {
    return (this.pagination);
  }

  public getEvents(): Observable<Event[]> {
    return (this.events.publishReplay(1).refCount());
  }

  private load(): void {
    this.http.get(this.REST_URI + this.pagination.toReqParamURIPart())
      .do(res => this.pagination.fromResponse(<Pageable>res.json()))
      .map(res => <Event[]>res.json().content)
      .subscribe(
        p => this.events.next(this.resolveEvents(p)),
        EventService.handleError,
        this.subscribeToEventTopic
      );
  }

  private resolveEvents(events: Event[]): Event[] {
    events.forEach(event =>
      this.resolveEvent(event)
    );
    return (events);
  }

  private resolveEvent(event: Event): Event {
    event.raid = this.raidService.resolveRaid(event.raid);
    return event;
  }

  public delete(id: number): void {
    this.http.delete(this.REST_URI + id)
      .subscribe(res => console.log(res.status),
        EventService.handleError,
        EventService.handleComplete);
  }

  public update(id: number, raidId: number, date: Date, difficulty: EventDifficulty): void {
    this.http.post(this.REST_URI + id + '/' + raidId + '/' + date.toDateString() + '/' + difficulty, null)
      .subscribe(res => console.log(res.status),
        EventService.handleError,
        EventService.handleComplete);
  }

  public create(raidId: number, date: Date, difficulty: EventDifficulty): void {
    this.http.put(this.REST_URI + raidId + '/' + date.toDateString() + '/' + difficulty, null)
      .subscribe(res => console.log(res.status),
        EventService.handleError,
        EventService.handleComplete);
  }

  private static handleComplete(): void {
    console.info('Observable completed');
  }

  private static handleError(error: any): any {
    console.error('An error occurred:', error);
    return Observable.throw(error);
  }

  private subscribeToEventTopic = (): void => {
    if (this.webSocketSubscription == null) {
      this.webSocketMessages = this.stompService.subscribe('/idkp/topic/events');
      this.webSocketSubscription = this.webSocketMessages.subscribe(this.eventChanged);
    }
  };

  private eventChanged = (message: Message): void => {
    let eventChange: EventChange = JSON.parse(message.body);
    switch (eventChange.changeType) {
      case "CREATED": {
        this.addEventToSubject(this.resolveEvent(eventChange.notifyable));
        break;
      }
      case "UPDATED": {
        this.updateEventInSubject(this.resolveEvent(eventChange.notifyable));
        break;
      }
      case "REMOVED": {
        this.removeEventFromSubject(this.resolveEvent(eventChange.notifyable));
        break;
      }
    }
  };

  private removeEventFromSubject(event: Event): void {
    const newEvents = this.events.getValue();
    _.remove(newEvents, (e: Event) => e.id === event.id);
    this.events.next(newEvents);
  }

  private addEventToSubject(event: Event): void {
    const newEvents = this.events.getValue();
    newEvents.push(event);
    this.events.next(newEvents);
  }

  private updateEventInSubject(event: Event): void {
    const newEvents = this.events.getValue();
    const idx = _.findIndex(newEvents, (e: Event) => e.id === event.id);
    if (idx !== -1) {
      newEvents[idx] = event;
      this.events.next(newEvents);
    }
  }
}
