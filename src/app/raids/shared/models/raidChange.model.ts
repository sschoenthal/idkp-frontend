import {Raid} from "./raid.model";
export interface RaidChange {
  changeType: string;
  notifyable: Raid;
}
