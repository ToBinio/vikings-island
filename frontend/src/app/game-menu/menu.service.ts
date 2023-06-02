import { Injectable } from '@angular/core';
import {LogOutService} from "../log-out/log-out.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {Router} from "@angular/router";
import {AdminAuthService} from "../auth/adminAuth/admin-auth.service";
import {environment} from "../../environments/environment";
import {WaitListEvent} from "../../../../types/waitList";

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(public logOutService: LogOutService, private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService, private router: Router, public adminAuth: AdminAuthService) {
  }

  source: EventSource | undefined;
  gameID: number | undefined;

  listen() {
    this.source = new EventSource(environment.apiUrl + '/event/wait_list/' + this.gameID + "?token=" + this.cookieService.get("token"));

    console.log("listening?");

    this.source.addEventListener('open', message => {
      console.log('Got', message);
    });

    this.source.addEventListener('message', message => {
      console.log('Got', message);
      let waitListEvent = JSON.parse(message.data) as WaitListEvent;

      if (waitListEvent.gameId != -1) {
        this.joinRunningGame(waitListEvent.gameId);
        this.router.navigate(["/game"]);
      } else {
        console.log(waitListEvent.players)
      }
    });
  }

  unListen() {
    console.log("unlisten")
    this.source!.close()
  }

  leaveNewGame() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.post(environment.apiUrl + "/new_game/leave/" + this.gameID, {}, {headers: headers}).subscribe({
      next: res => {
        console.log("left successful");
        this.gameID = undefined;
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

  joinNewGame(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.gameID = id;
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
        this.unListen();
      }
    })
  }

  joinRunningGame(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    this.gameID = id;
    this.listen();

    this.httpClient.get(environment.apiUrl + "/game/" + id, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> joined");
        this.router.navigate(["/game"]);//todo
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
        this.unListen();
      }
    })
  }


}
