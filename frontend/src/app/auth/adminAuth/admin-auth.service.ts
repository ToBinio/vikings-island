import {Injectable} from '@angular/core';
import {AuthService} from "../loginAuth/auth.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginService} from "../../login/login.service";
import {CookieService} from "ngx-cookie-service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  isAuth: undefined | boolean = undefined

  constructor(private loginAuthService: AuthService, private httpClient: HttpClient, private loginService: LoginService, private cookieService: CookieService) {
  }

  isAuthenticated(): Observable<boolean> {

    console.log("updating");

    return new Observable<boolean>((subscriber) => {
      if (!this.loginAuthService.isAuthenticated()) {
        subscriber.next(false);

        console.log("setcache false");
        this.isAuth = false;
        return
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("token")}`
      })

      this.httpClient.get<{
        is_admin: boolean,
        name: string,
        id: number
      }>(environment.apiUrl + "/user/" + this.cookieService.get("id"), {headers: headers})
        .subscribe({
          next: res => {
            subscriber.next(res.is_admin);
            this.isAuth = res.is_admin;

            console.log("setcache: " + res.is_admin);
          },
          error: res => {
            subscriber.next(false)
            this.isAuth = false;

            console.log("setcache: " + false);
          }
        })
    })
  }

  public updateCache() {
    this.isAuthenticated().subscribe();
  }


  public tryUpdateCache() {
    if (this.isAuth == undefined)
      this.isAuthenticated().subscribe();
  }
}
