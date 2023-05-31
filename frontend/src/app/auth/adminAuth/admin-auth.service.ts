import {Injectable} from '@angular/core';
import {AuthService} from "../loginAuth/auth.service";
import {Router} from "@angular/router";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {LoginService} from "../../login/login.service";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  isAdmin = false;

  constructor(private loginAuthService: AuthService, private httpClient: HttpClient, private loginService: LoginService, private cookieService: CookieService) {
    if (loginAuthService.isAuthenticated()) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.cookieService.get("token")}`
      })

      if (this.httpClient.get(environment.apiUrl + "/user/" + this.loginService.id, {headers: headers})
        .subscribe({
          next: res => {
            this.isAdmin = true;
          }
        })) {
      }
    }
  }

  isAuthenticated() {
    return this.isAdmin;
  }
}
