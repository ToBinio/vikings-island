import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Ship} from "../../../../../types/ship";
import {GameServiceService} from "../game-service.service";
import {UsernameService} from "../../name-system/username.service";
import {HttpClient} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../../alert-system/alert.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnChanges {

  constructor(public cookieService: CookieService, private httpClient: HttpClient, private alertService: AlertService, public gameService: GameServiceService, private nameService: UsernameService) {
  }

  setName() {
    if (this.userID != undefined) {
      this.nameService.getName(this.userID).then((name) => {
        this.userName = name
      })
    }
  }

  ngOnInit(): void {
    this.setName();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setName();
  }

  @Input() ship!: Ship;
  @Input() playerID!: number;
  @Input() userID!: number | undefined;

  userName: undefined | string = undefined

  drive() {
    this.gameService.driveActive = !this.gameService.driveActive;
  }
}
