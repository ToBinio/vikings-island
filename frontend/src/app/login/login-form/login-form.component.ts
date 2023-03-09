import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest, UserLoginResponse} from "../../../../../types/user";
import {Observable} from "rxjs";
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

    this.sendDataToBackend({userName: this.userName, password: passwordHash} as UserLoginRequest)
      .subscribe(res => {
        this.token = res.token;
      })
  }

  sendDataToBackend(userLoginRequest: UserLoginRequest): Observable<UserLoginResponse> {
    return this.httpClient.post<UserLoginResponse>(this.baseURL, userLoginRequest);
  }
}
