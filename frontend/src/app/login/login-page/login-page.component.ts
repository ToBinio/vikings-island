import {Component, OnInit} from '@angular/core';
import {LoginService} from "../login.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor(public loginService: LoginService) {
  }

  ngOnInit(): void {
  }

  isLoginFormActive: boolean = true;

  changeActiveForm() {
    this.isLoginFormActive = !this.isLoginFormActive;
  }

}
