import {Component} from '@angular/core';

import {ConfirmationService} from 'primeng/primeng';

import * as _ from 'lodash';

import {EventService} from './shared/services/event.service';
import {Event} from './shared/models/event.model';
import {Pagination} from '../common/utils/pagination.util';
import {Observable} from "rxjs/Observable";

import {TranslateService} from '@ngx-translate/core';
import {Raid} from "../raids/shared/models/raid.model";
import {RaidService} from "../raids/shared/services/raid.service";

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent {

  public pageSizeSelectOptions: PageSizeSelectOption[] = [
    new PageSizeSelectOption(5, 'EVENT.LIST.PERPAGE.SMALL'),
    new PageSizeSelectOption(10, 'EVENT.LIST.PERPAGE.MEDIUM'),
    new PageSizeSelectOption(20, 'EVENT.LIST.PERPAGE.LARGE')
  ];

  displayDialog: boolean;
  newEvent: boolean;
  event: Event = new NewEvent();

  pagination: Pagination;

  constructor(private eventService: EventService,
              private raidService: RaidService,
              private confirmationService: ConfirmationService,
              private translationService: TranslateService) {
    this.pagination = eventService.getPagination();
  }

  getEvents(): Observable<Event[]> {
    return (this.eventService.getEvents());
  }

  getRaids(): Observable<Raid[]> {
    return (this.raidService.getRaids());
  }

  showDialogToAdd(): void {
    this.newEvent = true;
    this.event = new NewEvent();
    this.displayDialog = true;
  }

  showDialogToEdit(event: Event): void {
    this.newEvent = false;
    this.event = _.cloneDeep(event);
    alert(this.event.date);
    this.displayDialog = true;
  }

  raidEquals(raid1: Raid, raid2: Raid): boolean {
    return raid1 && raid2 ? raid1.id === raid2.id : raid1 === raid2;
  }

  onRemoveClick(): void {
    this.confirmationService.confirm({
      message: this.translationService.instant('EVENT.CONFIRM.DELETE.MESSAGE', {value: this.event.id}),
      header: this.translationService.instant('EVENT.CONFIRM.DELETE.HEADER'),
      icon: 'fa fa-trash',
      accept: () => {
        this.eventService.delete(this.event.id);
        this.displayDialog = false;
      }
    });
  }

  onSaveClick(): void {
    this.eventService.update(this.event.id, this.event.raid.id, this.event.date, this.event.difficulty);
    this.displayDialog = false;
  }

  onAddClick(): void {
    this.eventService.create(this.event.raid.id, this.event.date, this.event.difficulty);
    this.displayDialog = false;
  }
}

class NewEvent implements Event {

  raid: Raid;

  constructor() {
    this.raid = new NewRaid();
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


