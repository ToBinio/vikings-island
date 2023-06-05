import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Island} from "../../../../../types/island";
import {GameServiceService} from "../game-service.service";
import {UsernameService} from "../../name-system/username.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../../alert-system/alert.service";

@Component({
  selector: 'app-island-menu',
  templateUrl: './island-menu.component.html',
  styleUrls: ['./island-menu.component.scss']
})
export class IslandMenuComponent implements OnInit, OnChanges {

  constructor(public gameService: GameServiceService, private nameService: UsernameService, private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService) {
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

  @Input() island!: Island;
  @Input() playerID!: number;
  @Input() userID!: number | undefined;

  userName: undefined | string = undefined

  buyShip() {
    this.gameService.spawnShip(this.island.id);
  }

}
