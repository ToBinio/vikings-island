import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {ActivatedRoute, Router} from "@angular/router";
import {GameData} from "../../../../types/games";
import {IslandUpgradeRequest} from "../../../../types/island";
import {ShipUpgradeRequest} from "../../../../types/ship";

@Injectable({
  providedIn: 'root'
})
export class GameServiceService implements OnInit {

  gameId!: number;

  constructor(private cookieService: CookieService, private httpClient: HttpClient, private alertService: AlertService, private router: Router, private route: ActivatedRoute) {
    let list = this.router.url.split("/");

    this.gameId = parseInt(list[list.length - 1]);
  }

  ngOnInit(): void {

  }

  driveActive: boolean = false;

  spawnShip(islandId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })


    this.httpClient.post(environment.apiUrl + "/game/ship/spawn", {
      islandId: islandId,
      gameId: this.gameId
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

  upgradeIsland(what: string, islandId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    let request: IslandUpgradeRequest = {islandId: islandId, gameId: this.gameId}

    console.log(request)

    this.httpClient.post<GameData>(environment.apiUrl + "/game/island/upgrade/" + what, request, {headers: headers}).subscribe({
      next: res => {
        console.log(res)
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

  upgradeShip(what: string, shipId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    let request: ShipUpgradeRequest = {shipId: shipId, gameId: this.gameId}

    this.httpClient.post<GameData>(environment.apiUrl + "/game/ship/upgrade/" + what, request, {headers: headers}).subscribe({
      next: res => {
        console.log(res)
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
