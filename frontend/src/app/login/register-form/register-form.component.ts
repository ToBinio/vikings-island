import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";
import {LoginService} from "../login.service";
import {AlertService} from "../../alert-system/alert.service";

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  constructor(private httpClient: HttpClient, private router: Router, private alertSystemService: AlertService) {
  }

  userName: string = "";
  password: string = "";
  passwordCheck: string = "";

  token: string = "";

  checkPasswordCorrectness(password: string, passwordCheck: string) {
    return password === passwordCheck;
  }

  async register() {
    if (!this.checkPasswordCorrectness(this.password, this.passwordCheck)) {
      console.log("the passwords are different");
      this.error("Die Passwörter müssen gleich sein!")
      return;
    }

    let passwordHash = await hashPassword(this.password);

    this.httpClient.post<string>(environment.apiUrl + "/user/register", {
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
              case 403: {
                console.error("user already in database");
                this.error("Dieser Benutzer existiert bereits!")
                break;
              }
              case 406: {
                console.error("userName not allowed");
                this.error("Dieser Benutzername ist nicht erlaubt! Verwenden Sie: ^[a-zA-Z1-9._]+$")
                break;
              }
              default: {
                console.error("something went wrong");
                this.error("error")
              }
            }
          }
        }
      )
  }

  @Output() changeForm: EventEmitter<void> = new EventEmitter<void>();

  changeFormFunc() {
    this.changeForm.emit();
  }

  error(msg: string) {
    this.alertSystemService.error([msg]);
  }
}
