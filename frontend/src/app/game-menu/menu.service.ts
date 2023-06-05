import {Injectable} from '@angular/core';
import {LogOutService} from "../log-out/log-out.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AdminAuthService} from "../auth/adminAuth/admin-auth.service";
import {environment} from "../../environments/environment";
import {WaitListEvent} from "../../../../types/waitList";
import {UsernameService} from "../name-system/username.service";

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private route: ActivatedRoute, public logOutService: LogOutService, private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService, private router: Router, public adminAuth: AdminAuthService, private nameService: UsernameService) {
  }

  waitListSource: EventSource | undefined;
  gameID: number | undefined;

  waitListPlayers: string[] = [];

  listenWaitlist(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.waitListSource = new EventSource(environment.apiUrl + '/event/wait_list/' + this.gameID + "?token=" + this.cookieService.get("token"));

      console.log("listening?");

      this.waitListSource.addEventListener('open', message => {
        console.log('Got', message);
        resolve();
      });

      this.waitListSource.addEventListener('message', message => {
        console.log('Got', message);
        let waitListEvent = JSON.parse(message.data) as WaitListEvent;

        this.waitListPlayers = [];

        for (let player of waitListEvent.players) {
          this.nameService.getName(player).then((name) => {
            this.waitListPlayers.push(name)
          })
        }

        if (waitListEvent.gameId != -1) {
          this.joinRunningGame(waitListEvent.gameId);
          this.unListenWaitlist();
          this.router.navigate(["/game/" + this.gameID]).then();
        }
      });
    })
  }

  unListenWaitlist() {
    console.log("unlisten waitlist")
    this.waitListSource!.close()
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
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
            console.error("something went wrong")
          }
        }
        console.log("erororororo")
      }
    })
  }

  async joinNewGame(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.gameID = id;
    await this.listenWaitlist();

    this.httpClient.post(environment.apiUrl + "/new_game/join/" + id, {}, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> joined");
        this.router.navigate(["/waitlist"]);
      },
      error: err => {
        switch (err.status) {
          case 406: {
            this.alertService.httpError(err)
            console.error(err);
            break
          }
          default: {
            this.alertService.httpError(err)
            console.error("something went wrong")
          }
        }
        this.unListenWaitlist();
      }
    })
  }

  joinRunningGame(id: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    this.gameID = id;
    console.log(id)

    this.httpClient.get(environment.apiUrl + "/game/" + id, {headers: headers}).subscribe({
      next: res => {
        console.log("ok -> joined");
        this.router.navigate(["/game/" + this.gameID]);
      },
      error: err => {
        switch (err.status) {
          case 406: {
            this.alertService.httpError(err)
            console.error(err);
            break
          }
          default: {
            this.alertService.httpError(err)
            console.error("something went wrong")
          }
        }
        this.unListenWaitlist();
      }
    })
  }

}
