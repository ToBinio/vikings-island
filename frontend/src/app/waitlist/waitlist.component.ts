import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {MenuService} from "../game-menu/menu.service";

@Component({
  selector: 'app-waitlist',
  templateUrl: './waitlist.component.html',
  styleUrls: ['./waitlist.component.scss']
})
export class WaitlistComponent implements OnInit, OnDestroy {

  constructor(private router: Router, public menuService: MenuService) { }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (!this.clicked) {
      this.unlisten();
    }
  }

  clicked: boolean = false;

  unlisten() {
    this.clicked = true;
    this.menuService.unListen();
    this.menuService.leaveNewGame();
    this.router.navigate(["/games"]);
  }

}
