import {Component, EventEmitter, Output} from '@angular/core';
import {Observable} from "rxjs";
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
      alert("the passwords are different")
      return;
    }

    let passwordHash = await hashPassword(this.password);

    this.sendDataToBackend({userName: this.userName, password: passwordHash} as UserLoginRequest)
      .subscribe(res => {
        this.token = res;
      })
  }

  sendDataToBackend(userLoginRequest: UserLoginRequest): Observable<string> {
    return this.httpClient.post<string>(this.baseURL, userLoginRequest, {responseType: "text" as 'json'});
  }

  @Output() changeForm: EventEmitter<void> = new EventEmitter<void>();

  changeFormFunc() {
    this.changeForm.emit();
  }
}
