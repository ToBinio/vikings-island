import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  constructor(private httpClient: HttpClient, private router: Router) {
  }

  baseURL: string = "http://localhost:3000/api/user/register"

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

    this.httpClient.post<string>(this.baseURL, {
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
