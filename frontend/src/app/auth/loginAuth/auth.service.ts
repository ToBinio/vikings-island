import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  isLoggedIn = false;

  constructor(private cookieService: CookieService) {
    if (this.cookieService.get("token") != "") {
      this.isLoggedIn = true;
    }
  }

  isAuthenticated() {
    return this.isLoggedIn;
  }
}
