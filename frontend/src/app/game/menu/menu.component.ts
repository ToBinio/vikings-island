import {Component, Input, OnInit} from '@angular/core';
import {Ship} from "../../../../../types/ship";
import {GameServiceService} from "../game-service.service";
import {UsernameService} from "../../name-system/username.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(public gameService: GameServiceService, private nameService: UsernameService) {
  }

  ngOnInit(): void {
    if (this.userID != undefined) {
      this.nameService.getName(this.userID).then((name) => {
        this.userName = name
      })
    }
  }

  @Input() ship!: Ship;
  @Input() playerID!: number;
  @Input() userID!: number | undefined;

  userName: undefined | string = undefined

  drive() {
    this.gameService.driveActive = !this.gameService.driveActive;
  }

}
