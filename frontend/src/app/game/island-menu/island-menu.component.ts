import {Component, Input, OnInit} from '@angular/core';
import {Ship} from "../../../../../types/ship";
import {Island} from "../../../../../types/island";
import {GameServiceService} from "../game-service.service";

@Component({
  selector: 'app-island-menu',
  templateUrl: './island-menu.component.html',
  styleUrls: ['./island-menu.component.scss']
})
export class IslandMenuComponent implements OnInit {

  constructor(private gameService: GameServiceService) { }

  ngOnInit(): void {
  }

  @Input() island!: Island;
  @Input() playerID!: number;

  buyShip() {
    this.gameService.spawnShip(this.island.id);
  }
}
