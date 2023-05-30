import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginPageComponent} from "./login/login-page/login-page.component";
import {GameMenuComponent} from "./game-menu/game-menu.component";
import {GameComponent} from "./game/game.component";
import {WaitlistComponent} from "./waitlist/waitlist.component";
import {AdminPanelComponent} from "./admin-panel/admin-panel.component";

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'games', component: GameMenuComponent},
  {path: 'game', component: GameComponent},
  {path: 'waitList', component: WaitlistComponent},
  {path: 'admin', component: AdminPanelComponent},
  {path: '', pathMatch: 'full', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {


}
