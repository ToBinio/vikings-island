import {Component, Input, OnInit} from '@angular/core';
import {Ship} from "../../../../../types/ship";
import {GameServiceService} from "../game-service.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  constructor(private gameService: GameServiceService) { }

  ngOnInit(): void {
  }

  @Input() ship!: Ship;
  @Input() playerID!: number;

  drive() {
    this.gameService.driveActive = true;
  }

}
