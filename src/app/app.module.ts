import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {Routes, RouterModule} from '@angular/router';

import {ButtonModule, InputTextModule, DataTableModule, SharedModule, DialogModule, ContextMenuModule, ConfirmDialogModule} from 'primeng/primeng';
import {StompConfigService, StompService} from "@stomp/ng2-stompjs";

import {AppComponent} from './app.component';
import {PlayersComponent} from './players/players.component';
import {ConfigService} from './players/shared/services/config.service';

const routes: Routes = [];

@NgModule({
  declarations: [
    AppComponent,
    PlayersComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    ButtonModule,
    InputTextModule,
    DataTableModule,
    SharedModule,
    DialogModule,
    ConfirmDialogModule,
    ContextMenuModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [
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
