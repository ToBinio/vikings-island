import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {LoginPageComponent} from "./login/login-page/login-page.component";
import {GameMenuComponent} from "./game-menu/game-menu.component";

const routes: Routes = [
  {path: 'login', component: LoginPageComponent},
  {path: 'game', component: GameMenuComponent},
  {path: '', pathMatch: 'full', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule {


}
