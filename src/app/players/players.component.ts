import {Component} from '@angular/core';

import {ConfirmationService} from 'primeng/primeng';

import * as _ from 'lodash';

import {PlayerService} from './shared/services/player.service';
import {Player} from './shared/models/player.model';

@Component({
  selector: 'app-players',
  templateUrl: './players.component.html',
  styleUrls: ['./players.component.css'],
  providers: [PlayerService, ConfirmationService]
})
export class PlayersComponent {

  displayDialog: boolean;
  disabledInput: boolean = true;
  newPlayer: boolean;
  player: Player = new NewPlayer();

  constructor(public playerService: PlayerService,
              private confirmationService: ConfirmationService) {
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
      message: 'Do you want to delete the selected record?',
      header: 'Confirmation',
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
