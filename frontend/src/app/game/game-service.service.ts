import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class GameServiceService {

  constructor(private cookieService: CookieService, private httpClient: HttpClient, private alertService: AlertService, private router: Router) {
  }

  driveActive: boolean = false;

  spawnShip(islandId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    let list = this.router.url.split("/");

    this.httpClient.post(environment.apiUrl + "/game/ship/spawn", {
      islandId: islandId,
      gameId: parseInt(list[list.length - 1])
    }, {headers: headers}).subscribe({
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
            console.log(err);
            this.alertService.httpError(err)
          }
        }
      }
    })
  }

}
