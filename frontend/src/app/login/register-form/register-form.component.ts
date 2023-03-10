import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  constructor(private httpClient: HttpClient, private router: Router) {
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
      this.userError = false;
      this.passwordError = true;
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
            this.userError = false;
            this.passwordError = false;
            this.token = res;
            this.router.navigateByUrl("/game").then();
          },
          error: err => {
            switch (err.status) {
              case 403: {
                console.error("user already in database");
                this.userError = true;
                break;
              }
              case 406: {
                console.error("userName not allowed");
                break;
              }
              default: {
                console.error("something went wrong");
              }
            }
          }
        }
      )
  }

  @Output() changeForm: EventEmitter<void> = new EventEmitter<void>();
  userError: boolean = false;
  passwordError: boolean = false;

  changeFormFunc() {
    this.changeForm.emit();
  }
}
