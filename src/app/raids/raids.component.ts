import {Component} from '@angular/core';

import {ConfirmationService} from 'primeng/primeng';

import * as _ from 'lodash';

import {RaidService} from './shared/services/raid.service';
import {Raid} from './shared/models/raid.model';
import {Pagination} from '../common/utils/pagination.util';
import {Observable} from "rxjs/Observable";

import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-raids',
  templateUrl: './raids.component.html',
  styleUrls: ['./raids.component.css']
})
export class RaidsComponent {

  public pageSizeSelectOptions: PageSizeSelectOption[] = [
    new PageSizeSelectOption(5, 'RAID.LIST.PERPAGE.SMALL'),
    new PageSizeSelectOption(10, 'RAID.LIST.PERPAGE.MEDIUM'),
    new PageSizeSelectOption(20, 'RAID.LIST.PERPAGE.LARGE')
  ];

  displayDialog: boolean;
  newRaid: boolean;
  raid: Raid = new NewRaid();

  pagination: Pagination;

  constructor(private raidService: RaidService,
              private confirmationService: ConfirmationService, private translationService: TranslateService) {
    this.pagination = raidService.getPagination();
  }

  getRaids(): Observable<Raid[]> {
    return (this.raidService.getRaids());
  }

  showDialogToAdd(): void {
    this.newRaid = true;
    this.raid = new NewRaid();
    this.displayDialog = true;
  }

  showDialogToEdit(raid: Raid): void {
    this.newRaid = false;
    this.raid = _.cloneDeep(raid);
    this.displayDialog = true;
  }

  onRemoveClick(): void {
    this.confirmationService.confirm({
      message: this.translationService.instant('RAID.CONFIRM.DELETE.MESSAGE', {value : this.raid.name}),
      header: this.translationService.instant('RAID.CONFIRM.DELETE.HEADER'),
      icon: 'fa fa-trash',
      accept: () => {
        this.raidService.delete(this.raid.id);
        this.displayDialog = false;
      }
    });
  }

  onSaveClick(): void {
    this.raidService.update(this.raid.id, this.raid.name);
    this.displayDialog = false;
  }

  onAddClick(): void {
    this.raidService.create(this.raid.name);
    this.displayDialog = false;
  }
}
class NewRaid implements Raid {

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


