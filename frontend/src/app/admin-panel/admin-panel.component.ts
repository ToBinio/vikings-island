import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Game} from "../../../../types/games";
import {User} from "../../../../types/user";
import {hashPassword} from "../login/loginUtil";

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelComponent implements OnInit {

  constructor(private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService) {
  }

  ngOnInit(): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.get<Game[]>(environment.apiUrl + "/game/all", {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        console.log(res)
        this.games = res;
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
    });

    this.httpClient.get<User[]>(environment.apiUrl + "/user", {headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        this.users = res;
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
    });
  }

  games: Game[] = [];
  users: User[] = [];

  changePasswordActive: boolean = false;

  deleteUserByID(id: number) {
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].id == id) {
        this.users.splice(i, 1);
      }
    }
  }

  deleteGameByID(id: number) {
    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].id == id) {
        console.log(i)
        this.games.splice(i, 1);
      }
    }
  }

  deleteGame(gameID: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.delete(environment.apiUrl + "/game/" + gameID, {headers: headers}).subscribe();
    this.deleteGameByID(gameID);
  }

  deleteUser(userID: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.delete(environment.apiUrl + "/user/" + userID, {headers: headers}).subscribe();
    this.deleteUserByID(userID);
  }

  changePassword(userID: number, password: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    let hashedPassword = hashPassword(password);

    this.httpClient.post(environment.apiUrl + "/user/password/" + userID, hashedPassword, {headers: headers}).subscribe({
      next: res => {
        console.log(res);
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
    });
  }

  swapPasswordActive() {
    this.changePasswordActive = !this.changePasswordActive;
  }
}
