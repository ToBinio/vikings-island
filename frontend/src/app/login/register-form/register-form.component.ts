import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  constructor(private httpClient: HttpClient) {
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
      return;
    }

    let passwordHash = await hashPassword(this.password);

    this.httpClient.post<string>(this.baseURL, {
      userName: this.userName,
      password: passwordHash
    } as UserLoginRequest, {responseType: "text" as 'json'})
      .subscribe(
        res => {
          console.log("ok")
          this.token = res;
        },
        error => {
          switch (error.status) {
            case 403: {
              console.log("user already in database");
              break;
            }
            default: {
              console.log("something went wrong");
            }
          }
        }
      )
  }

}
