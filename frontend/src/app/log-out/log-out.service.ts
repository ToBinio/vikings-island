import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class LogOutService {

  constructor(private router: Router, private cookies: CookieService) { }

  logout() {
    this.cookies.deleteAll("/");
    console.log("->" + this.cookies.get("token"))
    this.router.navigate(["/login"]);
  }

}
