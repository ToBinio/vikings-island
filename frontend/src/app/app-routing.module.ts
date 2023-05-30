import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginPageComponent} from "./login/login-page/login-page.component";
import {GameMenuComponent} from "./game-menu/game-menu.component";
import {GameComponent} from "./game/game.component";
import {WaitlistComponent} from "./waitlist/waitlist.component";

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'games', component: GameMenuComponent},
  {path: 'game', component: GameComponent},
  {path: 'waitList', component: WaitlistComponent},
  {path: '', pathMatch: 'full', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {


}
