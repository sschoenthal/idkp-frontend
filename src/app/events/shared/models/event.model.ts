import {Raid} from "../../../raids/shared/models/raid.model";

export interface Event {

  id?: number;
  raid?: Raid;
  date?: Date;
  difficulty?: EventDifficulty;
}
