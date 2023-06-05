import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Router} from "@angular/router";
import {AdminAuthService} from "../auth/adminAuth/admin-auth.service";
import {LogOutService} from "../log-out/log-out.service";
import {MenuService} from "./menu.service";
import {CreateNewGame, Game, NewGame} from "../../../../types/games";
import {UsernameService} from "../name-system/username.service";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit {

  constructor(public menuService: MenuService, public logOutService: LogOutService, private httpClient: HttpClient, public cookieService: CookieService, private alertService: AlertService, private router: Router, public adminAuth: AdminAuthService, private nameService: UsernameService) {
  }

  ngOnInit(): void {
    //needed to cache the result
    this.adminAuth.tryUpdateCache();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.get<LocalNewGame[]>(environment.apiUrl + "/new_game", {headers: headers}).subscribe({
      next: res => {
        this.gameMenu = res;

        console.log(this.gameMenu);

        for (let game of this.gameMenu) {
          game.playerNames = []

          for (let player of game.players) {

            this.nameService.getName(player).then((name) => {
              game.playerNames.push(name);
            })
          }
        }
      },
      error: err => {
        switch (err.status) {
          case 403: {
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
          }
        }
      }
    });

    this.httpClient.get<Game[]>(environment.apiUrl + "/game", {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        console.log(res)
        this.ownGameMenu = res;
      },
      error: err => {
        switch (err.status) {
          case 403: {
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
          }
        }
      }
    });
  }

  gameMenu: LocalNewGame[] = [];
  ownGameMenu: Game[] = [];
  gameMenuActive: boolean = true;

  tickSpeed: number = 0;
  gameName: string = "";

  createActive: boolean = false;
  switchOn: boolean = false;

  create() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.post<number>(environment.apiUrl + "/new_game", {
      name: this.gameName,
      timeStamp: this.tickSpeed
    } as CreateNewGame, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> created");
        this.menuService.joinNewGame(res).then(() => {
          this.changeCreateActive();
          this.router.navigate(["/waitlist"]);
        });
      },
      error: err => {
        switch (err.status) {
          case 403: {
            this.alertService.httpError(err)
            break
          }
          case 406: {
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
          }
        }
      }
    })
  }

  changeCreateActive() {
    this.createActive = !this.createActive
  }

  admin() {
    this.router.navigateByUrl("/admin").then();
  }

  toggleSwitch() {
    this.gameMenuActive = this.switchOn;
    this.switchOn = !this.switchOn
  }

  close() {
    this.createActive = false;
  }

  logOut() {
    console.log(this.cookieService.get("token"))
    console.log(0)
    this.logOutService.logout()
  }
}

export interface LocalNewGame extends NewGame {
  playerNames: string[]
}
