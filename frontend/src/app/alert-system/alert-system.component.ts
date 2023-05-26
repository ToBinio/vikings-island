import {Component, Input, OnInit} from '@angular/core';
import {AlertService} from "./alert.service";

@Component({
  selector: 'app-alert-system',
  templateUrl: './alert-system.component.html',
  styleUrls: ['./alert-system.component.scss']
})
export class AlertSystemComponent {

  constructor(public alertService: AlertService) { }

}
