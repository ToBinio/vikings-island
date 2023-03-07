import {Component} from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {UserLoginRequest, UserLoginResponse} from "../../../../types/user";

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {

  constructor(private httpClient: HttpClient) {
  }

  baseURL: string = "localhost:3000/api/user/register"

  userName: string = "";
  password: string = "";
  passwordCheck: string = "";

  token: string = "";

  checkPasswordCorrectness(password: string, passwordCheck: string) {
    return password === passwordCheck;
  }

  async register() {
    if (!this.checkPasswordCorrectness(this.password, this.passwordCheck)) {
      alert("the passwords are different")
      return;
    }

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
