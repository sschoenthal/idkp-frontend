import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Player} from '.././models/player.model'
import {PlayerChange} from "../models/playerChange.model";

import 'rxjs/add/operator/toPromise';

import {Observable} from 'rxjs/Observable';
import {Message} from '@stomp/stompjs';

import {Subscription} from 'rxjs/Subscription';
import {StompService} from '@stomp/ng2-stompjs';


@Injectable()
export class PlayerService {

  private REST_URI: string = '/idkp/player/';

  private subscription: Subscription;
  private messages: Observable<Message>;
  private subscribed: boolean;

  private players: Player[] = [];

  constructor(private http: Http, private stompService: StompService) {
    this.subscribed = false;
    this.loadPlayers();
  }

  public delete(id: number) {
    this.http.delete(this.REST_URI + id).toPromise().then(res => console.log(res.status));
  }

  public update(id: number, name: String) {
    this.http.post(this.REST_URI + id + '/' + name, null).toPromise().then(res => console.log(res.status));
  }

  public create(name: String) {
    this.http.put(this.REST_URI + name, null).toPromise().then(res => console.log(res.status));
  }

  public getPlayers(): Player[] {
    return (this.players);
  }

  private loadPlayers() {
    this.http.get(this.REST_URI).toPromise()
      .then(res => <Player[]>res.json())
      .then(players => this.players = players)
      .then(unused => this.subscribe());
  }

  private subscribe() {
    if (this.subscribed) {
      return;
    }
    this.messages = this.stompService.subscribe('/idkp/topic/players');
    this.subscription = this.messages.subscribe(this.playerChanged);
    this.subscribed = true;
  }

  private playerChanged = (message: Message) => {
    var playerChange: PlayerChange = JSON.parse(message.body);
    switch (playerChange.changeType) {
      case "CREATED": {
        this.players = this.players.concat(playerChange.player);
        break;
      }
      case "UPDATED":
      case "DELETED": {
        for (let storedPlayer of this.players) {
          if (playerChange.player.id === storedPlayer.id) {
            if (playerChange.changeType === "UPDATED") {
              storedPlayer.name = playerChange.player.name;
              storedPlayer.debuff = playerChange.player.debuff;
            }
            if (playerChange.changeType === "DELETED") {
              this.players = this.players.filter(storedPlayer => storedPlayer.id !== playerChange.player.id);
            }
            break;
          }
        }
        break;
      }
    }
  }
}
