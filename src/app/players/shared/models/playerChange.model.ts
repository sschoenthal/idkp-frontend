import {Player} from "./player.model";
export interface PlayerChange {
  changeType: string;
  notifyable: Player;
}
