import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {AlertService} from "../../alert-system/alert.service";
import {CookieService} from "ngx-cookie-service";
import {AuthService} from "../../auth/loginAuth/auth.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  constructor(private httpClient: HttpClient, private router: Router, private alertSystemService: AlertService, private cookieService: CookieService, private auth: AuthService) {
  }

  userName: string = "";
  password: string = "";

  token: string = "";

  async login() {
    let passwordHash = await hashPassword(this.password);

    this.httpClient.post<string>(environment.apiUrl + "/user/login", {
      userName: this.userName,
      password: passwordHash
    } as UserLoginRequest, {responseType: "text" as 'json'})
      .subscribe({
        next: res => {
          console.log("ok")
          this.token = res;
          this.cookieService.set("token", this.token);
          this.auth.isLoggedIn = true;
          this.router.navigateByUrl("/games").then();
        },
        error: err => {
          switch (err.status) {
            case 404: {
              console.error("user not found");
              this.alertSystemService.error("Dieser Benutzer existiert nicht!")
              break;
            }
            case 409: {
              console.error("wrong password");
              this.alertSystemService.error("Das Passwort ist falsch!")
              break;
            }
            default: {
              console.error("something went wrong");
              this.alertSystemService.error("error")
            }
          }
        }
      })
  }

  @Output() changeForm: EventEmitter<void> = new EventEmitter<void>();

  changeFormFunc() {
    this.changeForm.emit();
  }
}
