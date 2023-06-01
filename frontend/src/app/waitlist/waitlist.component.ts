import { Component, OnInit } from '@angular/core';
import {MenuService} from "../game-menu/menu.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss']
})
export class WaitlistComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  unlisten() {
    this.router.navigate(["/games"]);
  }

}
