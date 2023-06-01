import { Component, OnInit } from '@angular/core';
import {LogOutService} from "./log-out.service";

@Component({
  selector: 'app-log-out',
  templateUrl: './log-out.component.html',
  styleUrls: ['./log-out.component.scss']
})
export class LogOutComponent implements OnInit {

  constructor(private logOutService: LogOutService) { }

  ngOnInit(): void {
    this.logOutService.logout()
  }

}
