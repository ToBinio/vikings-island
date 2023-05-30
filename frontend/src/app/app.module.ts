import {NgModule} from '@angular/core';
import {AppComponent} from './app.component';
import {LoginFormComponent} from './login/login-form/login-form.component';
import {RegisterFormComponent} from './login/register-form/register-form.component';
import {HttpClientModule} from "@angular/common/http";
import {LoginPageComponent} from './login/login-page/login-page.component';
import {AppRoutingModule} from './app-routing.module';
import {MatTooltipModule} from "@angular/material/tooltip";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { GameComponent } from './game/game.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GameMenuComponent} from './game-menu/game-menu.component';
import { AlertSystemComponent } from './alert-system/alert-system.component';
import { WaitlistComponent } from './waitlist/waitlist.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginFormComponent,
    RegisterFormComponent,
    LoginPageComponent,
    GameMenuComponent,
    AlertSystemComponent,
    GameMenuComponent,
    GameComponent,
    WaitlistComponent,
  ],
  imports: [
    HttpClientModule,
    AppRoutingModule,
    MatTooltipModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
