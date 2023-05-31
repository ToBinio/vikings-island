import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginPageComponent} from "./login/login-page/login-page.component";
import {GameMenuComponent} from "./game-menu/game-menu.component";
import {GameComponent} from "./game/game.component";
import {WaitlistComponent} from "./waitlist/waitlist.component";
import {AdminPanelComponent} from "./admin-panel/admin-panel.component";
import {AuthGuard} from "./auth/loginAuth/auth.guard";
import {AdminAuthGuard} from "./auth/adminAuth/admin-auth.guard";

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'games', component: GameMenuComponent, canActivate: [AuthGuard]},
  {path: 'game', component: GameComponent, canActivate: [AuthGuard]},
  {path: 'waitList', component: WaitlistComponent, canActivate: [AuthGuard]},
  {path: 'admin', component: AdminPanelComponent, canActivate: [AuthGuard, AdminAuthGuard]},
  {path: '', pathMatch: 'full', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {

}
