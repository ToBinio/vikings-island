import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Router} from "@angular/router";
import {CreateNewGame, NewGames} from "../../../../types/games";
import {AdminAuthService} from "../auth/adminAuth/admin-auth.service";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit {

  constructor(private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService, private router: Router, public adminAuth: AdminAuthService) {
  }

  ngOnInit(): void {

    //needed to cache the result
    this.adminAuth.tryUpdateCache();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.get<NewGames>(environment.apiUrl + "/new_game", {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        this.gameMenu = res;
        this.displayGames = this.gameMenu;
      },
      error: err => {
        switch (err.status) {
          case 403: {
            console.error(err)
            this.alertService.error(err)
            break
          }
          default: {
            console.error("something went wrong")
          }
        }
      }
    })
  }

  gameMenu: NewGames = [];
  ownGameMenu: NewGames = [];
  displayGames: NewGames = []

  tickSpeed: number = 0;
  gameName: string = "";

  id: number = 0;

  createActive: boolean = false;
  switchOn: boolean = false;

  changeCreateActive() {
    this.createActive = !this.createActive
  }

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
        console.log("ok");
        this.id = res
        this.router.navigateByUrl("/waitList").then();
        this.changeCreateActive()
      },
      error: err => {
        switch (err.status) {
          case 403: {
            console.error(err)
            this.alertService.error(err)
            break
          }
          case 406: {
            this.alertService.error(err)
            break
          }
          default: {
            console.error("something went wrong")
          }
        }
      }
    })
  }

  join(id: number) {
    console.log(id)
    console.log(this.cookieService.get("token"))
    this.router.navigateByUrl("/waitList").then();
  }

  admin() {
    this.router.navigateByUrl("/admin").then();
  }

  toggleSwitch() {
    if (this.switchOn) {
      this.displayGames = this.gameMenu
    } else {
      this.displayGames = this.ownGameMenu;
    }
    this.switchOn = !this.switchOn
  }

  close() {
    this.createActive = false;
  }
}
