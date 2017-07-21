import {Setting} from "./setting.model";
export interface SettingChange {
  changeType: string;
  notifyable: Setting;
}
