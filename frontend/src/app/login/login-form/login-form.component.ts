import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {LoginService} from "../login.service";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  constructor(private httpClient: HttpClient, private router: Router, private loginService: LoginService) {
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
          this.router.navigateByUrl("/game").then();
        },
        error: err => {
          switch (err.status) {
            case 404: {
              console.error("user not found");
              this.error("Dieser Benutzer existiert nicht!")
              break;
            }
            case 409: {
              console.error("wrong password");
              this.error("Das Passwort ist falsch!")
              break;
            }
            default: {
              console.error("something went wrong");
            }
          }
        }
      })
  }

  @Output() changeForm: EventEmitter<void> = new EventEmitter<void>();

  changeFormFunc() {
    this.changeForm.emit();
  }

  error(msg: string) {
    this.loginService.errorMSG = "";

    setTimeout(() => {
      this.loginService.errorMSG = msg;
    }, 100);
  }

}
