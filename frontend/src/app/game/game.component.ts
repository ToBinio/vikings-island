import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {AlertService} from "../alert-system/alert.service";
import {GameData} from "../../../../types/games";
import {UsernameService} from "../name-system/username.service";
import {Ship, ShipMoveRequest} from "../../../../types/ship";
import {Island} from "../../../../types/island";
import {GameServiceService} from "./game-service.service";
import {LoginService} from "../login/login.service";

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  constructor(public loginService: LoginService, private gameService: GameServiceService, private router: Router, public cookieService: CookieService, private httpClient: HttpClient, private alertService: AlertService, public nameService: UsernameService) {
  }

  @ViewChild('gameCanvas', {static: true})
  canvas!: ElementRef<HTMLCanvasElement>;

  MIN_ZOOM = 0.1
  SCROLL_SENSITIVITY = 0.01

  cameraOffset = {x: window.innerWidth / 2, y: window.innerHeight / 2}
  cameraZoom = 1
  lastZoom = this.cameraZoom

  isDragging = false
  dragStart = {x: 0, y: 0}

  downPostion = {x: 0, y: 0}

  initialPinchDistance: null | number = null

  name: string = "";
  playerID: number = 0;

  ngOnInit(): void {
    this.nameService.getName(parseInt(this.cookieService.get("id"))).then((res) => {
      this.name = res;
    });

    this.img.src = "assets/img/island.png";
    this.imgBlue.src = "assets/img/islandBlue.png";
    this.imgRed.src = "assets/img/islandRed.png";
    this.imgGreen.src = "assets/img/islandGreen.png";
    this.imgYellow.src = "assets/img/islandYellow.png";

    this.imgShipBlue.src = "assets/img/shipBlue.png";
    this.imgShipRed.src = "assets/img/shipRed.png";
    this.imgShipGreen.src = "assets/img/shipGreen.png";
    this.imgShipYellow.src = "assets/img/shipYellow.png";

    this.imgWater1.src = "assets/img/water1.png";
    this.imgWater2.src = "assets/img/water2.png";
    this.imgWater3.src = "assets/img/water3.png";
    this.imgWater4.src = "assets/img/water4.png";

    this.imgBoarder.src = "assets/img/boarder.png";
    this.imgBoarderGreen.src = "assets/img/boarderGreen.png";

    for (let x = 0; x < this.gameFieldSize; x++) {
      this.waters[x] = [];

      for (let y = 0; y < this.gameFieldSize; y++) {
        this.waters[x][y] = Math.floor(Math.random() * 4);
      }
    }

    let canvas = this.canvas.nativeElement;

    canvas.addEventListener('mousedown', (e) => this.onPointerDown(e))
    canvas.addEventListener('mouseup', (e) => this.onPointerUp(e))
    canvas.addEventListener('mousemove', (e) => this.onPointerMove(e))

    canvas.addEventListener('touchstart', (e) => this.handleTouch(e, (e) => this.onPointerDown(e)))
    canvas.addEventListener('touchend', (e) => this.handleTouch(e, (e) => this.onPointerUp(e)))
    canvas.addEventListener('touchmove', (e) => this.handleTouch(e, (e) => this.onPointerMove(e)))

    canvas.addEventListener('DOMMouseScroll', (e) => this.handleZoom(e), false);
    canvas.addEventListener('mousewheel', (e) => this.handleZoom(e), false);

    window.addEventListener("resize", () => this.redraw());

    this.redraw();

    this.getFirstData();
  }

  source: EventSource | undefined;

  leave() {
    this.source?.close();
    this.router.navigate(["/games"]);
  }

  getFirstData() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    });

    let list = this.router.url.split("/");

    this.httpClient.get<GameData>(environment.apiUrl + "/game/" + list[list.length - 1], {headers: headers}).subscribe({
      next: res => {
        console.log("GotGameData", res);
        this.gameData = res;

        for (let player of this.gameData!.players) {
          if (player.userId == parseInt(this.cookieService.get("id"))) {
            this.playerID = player.playerId;
          }
        }

        for (let player of this.gameData.players) {
          this.users.push(this.nameService.getName(player.userId!));
        }
        this.redraw();
        this.startEvent();
      },
      error: err => {
        switch (err.status) {
          case 403: {
            this.alertService.httpError(err)
            break
          }
          case 406: {
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
          }
        }
        this.router.navigate(["/login"])
      }
    })
  }

  startEvent() {
    let list = this.router.url.split("/");
    this.source = new EventSource(environment.apiUrl + '/event/game/' + list[list.length - 1] + "?token=" + this.cookieService.get("token"));

    console.log("listening?");

    this.source.addEventListener('open', message => {
      console.log("listening game");
    });

    this.source.addEventListener('message', message => {
      console.log('Got', message);
      this.gameData = JSON.parse(message.data);

      if (this.activeShip) {

        let shipId = this.activeShip.id;
        this.activeShip = undefined;

        for (let ship of this.gameData!.ships) {
          if (ship.id == shipId) {
            this.activeShip = ship;
            this.clickedCords = {x: ship.x, y: ship.y}
          }
        }
      }

      if (this.activeIsland) {
        for (let island of this.gameData!.islands) {
          if (island.id == this.activeIsland.id) {
            this.activeIsland = island;
          }
        }
      }

      this.redraw();
    });
  }

  gameData: GameData | undefined;
  tileSize: number = 50;
  gameFieldSize: number = 33;

  img = new Image();
  imgBlue = new Image();
  imgRed = new Image();
  imgGreen = new Image();
  imgYellow = new Image();

  imgShipBlue = new Image();
  imgShipRed = new Image();
  imgShipGreen = new Image();
  imgShipYellow = new Image();

  imgWater1 = new Image();
  imgWater2 = new Image();
  imgWater3 = new Image();
  imgWater4 = new Image();

  imgBoarder = new Image();
  imgBoarderGreen = new Image();

  waters: number[][] = [];

  users: Promise<string>[] = [];

  activeShip!: Ship | undefined;
  activeIsland!: Island | undefined;

  driveShip(x: number, y: number, gameID: number, shipID: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    this.httpClient.post(environment.apiUrl + "/game/ship/goal", {
      goalX: x,
      goalY: y,
      gameId: gameID,
      shipId: shipID
    } as ShipMoveRequest, {headers: headers}).subscribe({
      next: res => {
        console.log(res)
      },
      error: err => {
        switch (err.status) {
          case 403: {
            this.alertService.httpError(err)
            break
          }
          case 406: {
            this.alertService.httpError(err)
            break
          }
          default: {
            this.alertService.httpError(err)
          }
        }
      }
    })
  }

  render(ctx: CanvasRenderingContext2D) {

    //render checker
    if (this.gameData != undefined) {
      for (let x = 0; x < this.gameFieldSize; x++) {
        for (let y = 0; y < this.gameFieldSize; y++) {
          let img;

          switch (this.waters[x][y]) {
            case 0: {
              img = this.imgWater1
              break
            }
            case 1: {
              img = this.imgWater2
              break
            }
            case 2: {
              img = this.imgWater3
              break
            }
            case 3: {
              img = this.imgWater4
              break
            }
          }

          if (img != undefined) {
            ctx.drawImage(img, (x - this.gameFieldSize / 2) * this.tileSize, (y - this.gameFieldSize / 2) * this.tileSize, this.tileSize + 1, this.tileSize + 1)
          }
        }
      }

      for (let island of this.gameData.islands) {
        let img = this.img;

        for (let player of this.gameData.players) {
          if (player.playerId == island.playerId) {
            switch (player.color) {
              case "#00ff00": {
                img = this.imgGreen
                break;
              }
              case "#ff0000": {
                img = this.imgRed
                break
              }
              case "#0000ff": {
                img = this.imgBlue
                break;
              }
              case "#ffff00": {
                img = this.imgYellow
                break;
              }
            }
          }

          ctx.drawImage(img, (island.x - this.gameFieldSize / 2) * this.tileSize, (island.y - this.gameFieldSize / 2) * this.tileSize, this.tileSize, this.tileSize);
        }
      }

      let imgShip;

      for (let ship of this.gameData.ships) {
        if (this.activeShip != undefined && this.activeShip.goalX != undefined && this.activeShip.goalY != undefined && ship.x == this.activeShip!.x && ship.y == this.activeShip!.y) {
          ctx.drawImage(this.imgBoarderGreen, (ship.goalX! - this.gameFieldSize / 2) * this.tileSize, (ship.goalY! - this.gameFieldSize / 2) * this.tileSize, this.tileSize, this.tileSize)
        }

        for (let player of this.gameData.players) {
          if (player.playerId == ship.playerId) {
            switch (player.color) {
              case "#00ff00": {
                imgShip = this.imgShipGreen
                break;
              }
              case "#ff0000": {
                imgShip = this.imgShipRed
                break
              }
              case "#0000ff": {
                imgShip = this.imgShipBlue
                break;
              }
              case "#ffff00": {
                imgShip = this.imgShipYellow
                break;
              }
            }
          }

          if (imgShip != undefined) {
            ctx.drawImage(imgShip, (ship.x - this.gameFieldSize / 2) * this.tileSize, (ship.y - this.gameFieldSize / 2) * this.tileSize, this.tileSize, this.tileSize);
          }
        }
      }

      if (this.clickedCords != undefined) {
        ctx.drawImage(this.imgBoarder, (this.clickedCords.x - this.gameFieldSize / 2) * this.tileSize, (this.clickedCords.y - this.gameFieldSize / 2) * this.tileSize, this.tileSize, this.tileSize)
      }
    }
  }

  clickedCords!: { x: number, y: number } | undefined;

  onClick(pos: { x: number, y: number }) {
    let worldPos = this.screenXToWorldX(pos);

    let x = Math.floor(worldPos.x / this.tileSize + this.gameFieldSize / 2);
    let y = Math.floor(worldPos.y / this.tileSize + this.gameFieldSize / 2);

    if (x < 0 || x >= this.gameFieldSize || y < 0 || y >= this.gameFieldSize) return;

    console.log(x + "|" + y)

    if (this.gameService.driveActive) {
      this.driveShip(x, y, this.gameData!.id, this.activeShip!.id);
      this.clickedCords = {x: this.activeShip!.x, y: this.activeShip!.y}
      this.gameService.driveActive = false;
      this.redraw()
      return
    }

    for (let ship of this.gameData!.ships) {
      if (ship.x == x && ship.y == y) {
        this.activeShip = ship;
        this.activeIsland = undefined;
        this.clickedCords = {x: x, y: y};
        this.redraw()
        return
      }
    }

    for (let island of this.gameData!.islands) {
      if (island.x == x && island.y == y) {
        this.activeIsland = island;
        this.activeShip = undefined;
        this.clickedCords = {x: x, y: y};
        this.redraw()
        return;
      }
    }

    this.activeIsland = undefined;
    this.activeShip = undefined

    this.clickedCords = {x: x, y: y};
    this.redraw();
  }

  screenXToWorldX(pos: { x: number, y: number }): { x: number, y: number } {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d")!;

    const transform = ctx.getTransform();
    const invertedScaleX = 1 / transform.a;
    const invertedScaleY = 1 / transform.d;

    const transformedX = invertedScaleX * pos.x - invertedScaleX * transform.e;
    const transformedY = invertedScaleY * pos.y - invertedScaleY * transform.f;

    return {x: transformedX, y: transformedY}
  }

  redraw() {
    const canvas = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d")!;

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    ctx.translate(window.innerWidth / 2, window.innerHeight / 2)
    ctx.scale(this.cameraZoom, this.cameraZoom)
    ctx.translate(-window.innerWidth / 2 + this.cameraOffset.x, -window.innerHeight / 2 + this.cameraOffset.y)

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    this.render(ctx)
  }

  getEventLocation(e: any) {
    if (e.touches && e.touches.length == 1) {
      return {x: e.touches[0].clientX, y: e.touches[0].clientY}
    } else {
      return {x: e.clientX, y: e.clientY}
    }
  }

  onPointerDown(e: Event) {
    // this.clickedCords = undefined;
    // this.activeShip = undefined;
    // this.activeIsland = undefined;
    this.isDragging = true

    this.dragStart.x = this.getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x
    this.dragStart.y = this.getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y

    this.downPostion = this.getEventLocation(e);
  }

  onPointerUp(e: Event) {
    if ((this.downPostion.x - this.getEventLocation(e).x) ** 2 + (this.downPostion.y - this.getEventLocation(e).y) ** 2 < 5) {
      this.onClick(this.getEventLocation(e))
    }

    this.isDragging = false
    this.initialPinchDistance = null
    this.lastZoom = this.cameraZoom
  }

  onPointerMove(e: Event) {
    if (this.isDragging) {
      this.cameraOffset.x = this.getEventLocation(e).x / this.cameraZoom - this.dragStart.x
      this.cameraOffset.y = this.getEventLocation(e).y / this.cameraZoom - this.dragStart.y
      this.redraw()
    }

  }

  handleTouch(e: any, singleTouchHandler: (event: Event) => void) {
    if (e.touches.length == 1) {
      singleTouchHandler(e)
    } else if (e.type == "touchmove" && e.touches.length == 2) {
      this.isDragging = false
      this.handlePinch(e)
    }
  }

  handlePinch(e: any) {
    e.preventDefault()

    let touch1 = {x: e.touches[0].clientX, y: e.touches[0].clientY}
    let touch2 = {x: e.touches[1].clientX, y: e.touches[1].clientY}

    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

    if (this.initialPinchDistance == null) {
      this.initialPinchDistance = currentDistance
    } else {
      this.adjustZoom(null, currentDistance / this.initialPinchDistance)
    }
  }

  handleZoom(e: any) {
    // @ts-ignore
    let scroll = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

    this.adjustZoom(scroll * this.SCROLL_SENSITIVITY, null)
    e.preventDefault()
    return false;
  }

  adjustZoom(zoomAmount: number | null, zoomFactor: number | null) {
    if (!this.isDragging) {
      if (zoomAmount) {
        this.cameraZoom += zoomAmount
      } else if (zoomFactor) {
        this.cameraZoom = zoomFactor * this.lastZoom
      }

      this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM)

      this.redraw()
    }
  }

  getId(): number {
    return parseInt(this.cookieService.get("id"));
  }

  getUserFromId(playerId: number | undefined): number | undefined {

    if (this.gameData == undefined || playerId == undefined) return undefined

    for (let player of this.gameData.players) {
      if (player.playerId == playerId) {
        return player.userId
      }
    }

    return undefined;
  }
}
