import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Router} from "@angular/router";
import {CreateNewGame, NewGames} from "../../../../types/games";
import {AdminAuthService} from "../auth/adminAuth/admin-auth.service";
import {LogOutService} from "../log-out/log-out.service";
import {MenuService} from "./menu.service";

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrls: ['./game-menu.component.scss']
})
export class GameMenuComponent implements OnInit {

  constructor(public logOutService: LogOutService, private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService, private router: Router, public adminAuth: AdminAuthService) {
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
            this.alertService.error(err)
            console.error("something went wrong")
          }
        }
      }
    });

    this.httpClient.get<NewGames>(environment.apiUrl + "/game", {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        this.ownGameMenu = res;
      },
      error: err => {
        switch (err.status) {
          case 403: {
            console.error(err)
            this.alertService.error(err)
            break
          }
          default: {
            this.alertService.error(err)
            console.error("something went wrong")
          }
        }
      }
    });
  }

  gameMenu: NewGames = [];
  ownGameMenu: NewGames = [];
  displayGames: NewGames = [];

  tickSpeed: number = 0;
  gameName: string = "";

  createActive: boolean = false;
  switchOn: boolean = false;

  source: EventSource | undefined;

  id: number = 0;

  listen() {
    this.source = new EventSource(environment.apiUrl + '/event/wait_list/' + this.id + "?token=" + this.cookieService.get("token"));

    console.log("listening?");

    this.source.addEventListener('open', message => {
      console.log("open")
      console.log('Got', message);
    });

    this.source.addEventListener('message', message => {
      console.log("message")
      console.log('Got', message);
    });
  }

  unListen() {
    this.source!.close()

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.post(environment.apiUrl + "/new_game/leave/" + this.id, {}, {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        this.router.navigateByUrl("/games").then();
        console.log("listen closed")
      },
      error: err => {
        switch (err.status) {
          case 406: {
            this.alertService.error(err)
            console.error(err);
            break
          }
          default: {
            this.alertService.error(err)
            console.error("something went wrong")
          }
        }
      }
    })
  }

  create() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.listen();

    this.httpClient.post<number>(environment.apiUrl + "/new_game", {
      name: this.gameName,
      timeStamp: this.tickSpeed
    } as CreateNewGame, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> created");
        this.id = res
        this.changeCreateActive();
        this.router.navigate(["/waitlist"]);
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
            this.alertService.error(err)
            console.error("something went wrong")
          }
        }
      }
    })
  }

  join(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.id = id;
    this.listen();

    this.httpClient.post(environment.apiUrl + "/new_game/join/" + id, {}, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> joined");
        this.router.navigate(["/waitlist"]);
      },
      error: err => {
        switch (err.status) {
          case 406: {
            this.alertService.error(err)
            console.error(err);
            break
          }
          default: {
            this.alertService.error(err)
            console.error("something went wrong")
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
  logOut() {
    this.logOutService.logout()
  }
}
