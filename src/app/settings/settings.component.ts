import {Component} from '@angular/core';

import * as _ from 'lodash';

import {SettingService} from './shared/services/setting.service';
import {Setting} from './shared/models/setting.model';
import {Pagination} from '../common/utils/pagination.util';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {


  displayDialog: boolean;
  setting: Setting;

  pagination: Pagination;

  constructor(private settingService: SettingService) {
    this.pagination = settingService.getPagination();
  }

  getSettings(): Observable<Setting[]> {
    return (this.settingService.getSettings());
  }

  showDialogToEdit(setting: Setting): void {
    this.setting = _.cloneDeep(setting);
    this.displayDialog = true;
  }

  onSaveClick(): void {
    this.settingService.update(this.setting.id, this.setting.value);
    this.displayDialog = false;
  }
}


