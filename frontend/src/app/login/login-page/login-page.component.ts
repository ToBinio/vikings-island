import {Component, OnInit} from '@angular/core';
import {LogOutService} from "../../log-out/log-out.service";

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  isLoginFormActive: boolean = true;

  changeActiveForm() {
    this.isLoginFormActive = !this.isLoginFormActive;
  }

}
