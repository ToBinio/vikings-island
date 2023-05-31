import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest, UserLoginResponse} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {AlertService} from "../../alert-system/alert.service";
import {CookieService} from "ngx-cookie-service";
import {AuthService} from "../../auth/loginAuth/auth.service";
import {LoginService} from "../login.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  constructor(private httpClient: HttpClient, private router: Router, private alertSystemService: AlertService, private cookieService: CookieService, private auth: AuthService, private loginService: LoginService) {
  }

  userName: string = "";
  password: string = "";

  async login() {
    let passwordHash = await hashPassword(this.password);

    this.httpClient.post<UserLoginResponse>(environment.apiUrl + "/user/login", {
      userName: this.userName,
      password: passwordHash
    } as UserLoginRequest, {responseType: "text" as 'json'})
      .subscribe({
        next: res => {
          console.log("ok")
          this.loginService.token = res.token;
          console.log(res.token)
          this.loginService.id = res.id;
          this.cookieService.set("token", this.loginService.token);
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
