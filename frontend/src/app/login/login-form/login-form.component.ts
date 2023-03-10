import {Component, EventEmitter, Output} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest} from "../../../../../types/user";
import {hashPassword} from "../loginUtil";

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  constructor(private httpClient: HttpClient) {
  }

  baseURL: string = "http://localhost:3000/api/user/login"

  userName: string = "";
  password: string = "";

  token: string = "";

  async login() {
    let passwordHash = await hashPassword(this.password);

    this.httpClient.post<string>(this.baseURL, {
      userName: this.userName,
      password: passwordHash
    } as UserLoginRequest, {responseType: "text" as 'json'})
      .subscribe({
        next: res => {
          console.log("ok")
          this.token = res;
        },
        error: err => {
          switch (err.status) {
            case 404: {
              console.error("user not found");
              break;
            }
            case 409: {
              console.error("wrong password");
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
}
