import {Component, Input, OnInit} from '@angular/core';
import {Ship} from "../../../../../types/ship";
import {Island} from "../../../../../types/island";

@Component({
  selector: 'app-island-menu',
  templateUrl: './island-menu.component.html',
  styleUrls: ['./island-menu.component.scss']
})
export class IslandMenuComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() island!: Island;
  @Input() playerID!: number;

}
