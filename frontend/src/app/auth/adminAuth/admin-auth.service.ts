import {Injectable} from '@angular/core';
import {AuthService} from "../loginAuth/auth.service";
import {Router} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginService} from "../../login/login.service";
import {CookieService} from "ngx-cookie-service";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  constructor(private loginAuthService: AuthService, private httpClient: HttpClient, private loginService: LoginService, private cookieService: CookieService) {
  }

  isAuthenticated(): boolean | Observable<boolean> {
    if (!this.loginAuthService.isAuthenticated()) {
      return false
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    return new Observable<boolean>((subscriber) => {
      this.httpClient.get<{ is_admin: boolean, name: string, id: number }>(environment.apiUrl + "/user/" + this.cookieService.get("id"), {headers: headers})
        .subscribe({
          next: res => {
            subscriber.next(res.is_admin);
          },
          error: res => {
            subscriber.next(false)
          }
        })
    })
  }
}
