import {Component} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest, UserLoginResponse} from "../../../../../types/user";
import {Observable} from "rxjs";

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
    let passwordHash = await this.hash(this.password);

    this.sendDataToBackend({userName: this.userName, password: passwordHash} as UserLoginRequest)
      .subscribe(res => {
        this.token = res.token;
      })
  }

  sendDataToBackend(userLoginRequest: UserLoginRequest): Observable<UserLoginResponse> {
    return this.httpClient.post<UserLoginResponse>(this.baseURL, userLoginRequest);
  }

  async hash(password: string) {
    const utf8 = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray
      .map((bytes) => bytes.toString(16).padStart(2, '0'))
      .join('');
  }
}
