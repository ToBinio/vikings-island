import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MenuService} from "../game-menu/menu.service";

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss']
})
export class WaitlistComponent implements OnInit {

  constructor(private router: Router, public menuService: MenuService) { }

  ngOnInit(): void {
  }

  unlisten() {
    this.menuService.leaveNewGame();
    this.menuService.unListenWaitlist();
    this.router.navigate(["/games"]);
  }

}
