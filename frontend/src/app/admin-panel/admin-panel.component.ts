import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {NewGames} from "../../../../types/games";

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

    this.httpClient.get<NewGames>(environment.apiUrl + "/new_game",{headers: headers}).subscribe({
      next: res => {
        console.log("ok");
        this.gameMenu = res;
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

  gameMenu: NewGames = [];

  deleteGame(gameID: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.delete(environment.apiUrl + "/game/" + gameID, {headers: headers}).subscribe({
      next: res => {

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

}
