import {Component} from '@angular/core';

import {ConfirmationService, MenuItem} from 'primeng/primeng';

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
  player: Player = new PrimePlayer();

  contextMenuItems: MenuItem[] = [
    {label: 'View', icon: 'fa-search', command: (event) => this.showDialogToEdit()},
    {label: 'Delete', icon: 'fa-close', command: (event) => this.onRemoveClick()}
  ];

  constructor(public playerService: PlayerService,
              private confirmationService: ConfirmationService) {
  }

  showDialogToAdd() {
    this.newPlayer = true;
    this.player = new PrimePlayer();
    this.displayDialog = true;
  }

  private showDialogToEdit() {
    this.newPlayer = false;
    this.displayDialog = true;
  }

  onRemoveClick() {
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

  onSaveClick() {
    this.playerService.update(this.player.id, this.player.name);
    this.displayDialog = false;
  }

  onAddClick() {
    this.playerService.create(this.player.name);
    this.displayDialog = false;
  }
}
class PrimePlayer implements Player {

  constructor() {
  }
}
