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

import {Player} from '../models/player.model'
import {PlayerChange} from "../models/playerChange.model";
import {Pagination} from '../../../common/utils/pagination.util';
import {Pageable} from "../../../common/utils/pageable.model";

@Injectable()
export class PlayerService {

  private REST_URI: string = '/idkp/player/';

  private players: BehaviorSubject<Player[]> = new BehaviorSubject([]);
  private pagination: Pagination = new Pagination(0, 5, 'name');

  private webSocketSubscription: Subscription;
  private webSocketMessages: Observable<Message>;

  constructor(private http: Http, private stompService: StompService) {
    this.pagination.getObservable()
      .subscribe({
        next: (pagination: Pagination) => this.load()
      });
  }

  public getPagination(): Pagination {
    return (this.pagination);
  }

  public getPlayers(): Observable<Player[]> {
    return (this.players.publishReplay(1).refCount());
  }

  private load(): void {
    this.http.get(this.REST_URI + this.pagination.toReqParamURIPart())
      .do(res => this.pagination.fromResponse(<Pageable>res.json()))
      .map(res => <Player[]>res.json().content)
      .subscribe(
        p => this.players.next(p),
        PlayerService.handleError,
        this.subscribeToPlayerTopic
      );
  }

  public delete(id: number): void {
    this.http.delete(this.REST_URI + id)
      .subscribe(res => console.log(res.status),
        PlayerService.handleError,
        PlayerService.handleComplete);
  }

  public update(id: number, name: String): void {
    this.http.post(this.REST_URI + id + '/' + name, null)
      .subscribe(res => console.log(res.status),
        PlayerService.handleError,
        PlayerService.handleComplete);
  }

  public create(name: String): void {
    this.http.put(this.REST_URI + name, null)
      .subscribe(res => console.log(res.status),
        PlayerService.handleError,
        PlayerService.handleComplete);
  }

  private static handleComplete(): void {
    console.info('Observable completed');
  }

  private static handleError(error: any): any {
    console.error('An error occurred:', error);
    return Observable.throw(error);
  }

  private subscribeToPlayerTopic = (): void => {
    if (this.webSocketSubscription == null) {
      this.webSocketMessages = this.stompService.subscribe('/idkp/topic/players');
      this.webSocketSubscription = this.webSocketMessages.subscribe(this.playerChanged);
    }
  };

  private playerChanged = (message: Message): void => {
    let playerChange: PlayerChange = JSON.parse(message.body);
    switch (playerChange.changeType) {
      case "CREATED": {
        this.addPlayerToSubject(playerChange.notifyable);
        break;
      }
      case "UPDATED": {
        this.updatePlayerInSubject(playerChange.notifyable);
        break;
      }
      case "REMOVED": {
        this.removePlayerFromSubject(playerChange.notifyable);
        break;
      }
    }
  };

  private removePlayerFromSubject(player: Player): void {
    const newPlayers = this.players.getValue();
    _.remove(newPlayers, (p: Player) => p.id === player.id);
    this.players.next(newPlayers);
  }

  private addPlayerToSubject(player: Player): void {
    const newPlayers = this.players.getValue();
    newPlayers.push(player);
    this.players.next(newPlayers);
  }

  private updatePlayerInSubject(player: Player): void {
    const newPlayers = this.players.getValue();
    const idx = _.findIndex(newPlayers, (p: Player) => p.id === player.id);
    if (idx !== -1) {
      newPlayers[idx] = player;
      this.players.next(newPlayers);
    }
  }
}
