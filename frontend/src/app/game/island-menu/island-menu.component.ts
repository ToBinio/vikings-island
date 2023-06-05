import {Component, Input, OnInit} from '@angular/core';
import {Island} from "../../../../../types/island";
import {GameServiceService} from "../game-service.service";
import {UsernameService} from "../../name-system/username.service";

@Component({
  selector: 'app-island-menu',
  templateUrl: './island-menu.component.html',
  styleUrls: ['./island-menu.component.scss']
})
export class IslandMenuComponent implements OnInit {

  constructor(public gameService: GameServiceService, private nameService: UsernameService) {
  }

  ngOnInit(): void {
    if (this.userID != undefined) {
      this.nameService.getName(this.userID).then((name) => {
        this.userName = name
      })
    }
  }

  @Input() island!: Island;
  @Input() playerID!: number;
  @Input() userID!: number | undefined;

  userName: undefined | string = undefined

  buyShip() {
    this.gameService.spawnShip(this.island.id);
  }
}
