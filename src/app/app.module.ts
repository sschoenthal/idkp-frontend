import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Routes, RouterModule} from '@angular/router';

import {
  ButtonModule, InputTextModule, SharedModule, DialogModule, ConfirmDialogModule, CalendarModule,
  ConfirmationService
} from 'primeng/primeng';

import {StompConfigService, StompService} from "@stomp/ng2-stompjs";

import {AppComponent} from './app.component';
import {PlayersComponent} from './players/players.component';
import {RaidsComponent} from './raids/raids.component';
import {EventsComponent} from './events/events.component';
import {SettingsComponent} from './settings/settings.component';
import {ConfigService} from './common/websocket/config.service';
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from '@ngx-translate/http-loader';

import {RaidService} from "./raids/shared/services/raid.service";
import {PlayerService} from "./players/shared/services/player.service";
import {EventService} from "./events/shared/services/event.service";
import {SettingService} from "./settings/shared/services/setting.service";

const routes: Routes = [];

export function createTranslateLoader(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    PlayersComponent,
    RaidsComponent,
    EventsComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ButtonModule,
    InputTextModule,
    SharedModule,
    DialogModule,
    ConfirmDialogModule,
    CalendarModule,
    RouterModule.forRoot(routes, {useHash: true}),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [Http]
      }
    })
  ],
  providers: [
    SettingService,
    PlayerService,
    RaidService,
    EventService,
    ConfirmationService,
    StompService,
    {
      provide: StompConfigService,
      useClass: ConfigService
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
