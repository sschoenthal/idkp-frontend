import {Component} from '@angular/core';

import {ConfirmationService} from 'primeng/primeng';

import * as _ from 'lodash';

import {PlayerService} from './shared/services/player.service';
import {Player} from './shared/models/player.model';
import {Pagination} from '../common/utils/pagination.util';
import {Observable} from "rxjs/Observable";

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  providers: [PlayerService, ConfirmationService]
})
export class PlayersComponent {

  public pageSizeSelectOptions: PageSizeSelectOption[] = [
    new PageSizeSelectOption(5, 'PLAYER.LIST.PERPAGE.SMALL'),
    new PageSizeSelectOption(10, 'PLAYER.LIST.PERPAGE.MEDIUM'),
    new PageSizeSelectOption(20, 'PLAYER.LIST.PERPAGE.LARGE')
  ];

  displayDialog: boolean;
  newPlayer: boolean;
  player: Player = new NewPlayer();

  pagination: Pagination;

  constructor(private playerService: PlayerService,
              private confirmationService: ConfirmationService, private translationService: TranslateService) {
    this.pagination = playerService.getPagination();
  }

  getPlayers(): Observable<Player[]> {
    return (this.playerService.getPlayers());
  }

  showDialogToAdd(): void {
    this.newPlayer = true;
    this.player = new NewPlayer();
    this.displayDialog = true;
  }

  showDialogToEdit(player: Player): void {
    this.newPlayer = false;
    this.player = _.cloneDeep(player);
    this.displayDialog = true;
  }

  onRemoveClick(): void {
    this.confirmationService.confirm({
      message: this.translationService.instant('PLAYER.CONFIRM.DELETE.MESSAGE', {value : this.player.name}),
      header: this.translationService.instant('PLAYER.CONFIRM.DELETE.HEADER'),
      icon: 'fa fa-trash',
      accept: () => {
        this.playerService.delete(this.player.id);
        this.displayDialog = false;
      }
    });
  }

  onSaveClick(): void {
    this.playerService.update(this.player.id, this.player.name);
    this.displayDialog = false;
  }

  onAddClick(): void {
    this.playerService.create(this.player.name);
    this.displayDialog = false;
  }
}
class NewPlayer implements Player {

  constructor() {
  }
}
class PageSizeSelectOption {
  size: number;
  name: string;

  constructor(size: number, name: string) {
    this.size = size;
    this.name = name;
  }
}


