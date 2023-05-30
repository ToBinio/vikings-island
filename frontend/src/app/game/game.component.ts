import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  @ViewChild('gameCanvas', {static: true})
  canvas!: ElementRef<HTMLCanvasElement>;

  MIN_ZOOM = 0.1
  SCROLL_SENSITIVITY = 0.01

  cameraOffset = {x: window.innerWidth / 2, y: window.innerHeight / 2}
  cameraZoom = 1
  lastZoom = this.cameraZoom

  isDragging = false
  dragStart = {x: 0, y: 0}

  initialPinchDistance: null | number = null

  ngOnInit(): void {

    let canvas = this.canvas.nativeElement;

    canvas.addEventListener('mousedown', (e) => this.onPointerDown(e))
    canvas.addEventListener('mouseup', () => this.onPointerUp())
    canvas.addEventListener('mousemove', (e) => this.onPointerMove(e))

    canvas.addEventListener('touchstart', (e) => this.handleTouch(e, (e) => this.onPointerDown(e)))
    canvas.addEventListener('touchend', (e) => this.handleTouch(e, () => this.onPointerUp()))
    canvas.addEventListener('touchmove', (e) => this.handleTouch(e, (e) => this.onPointerMove(e)))

    canvas.addEventListener('DOMMouseScroll', (e) => this.handleZoom(e), false);
    canvas.addEventListener('mousewheel', (e) => this.handleZoom(e), false);

    window.addEventListener("resize", () => this.redraw());

    this.redraw();
  }

  render(ctx: CanvasRenderingContext2D) {
    //render checker
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        if ((x + y) % 2) {
          ctx.fillStyle = "gray";
        } else {
          ctx.fillStyle = "black";
        }

        ctx.fillRect(x * 100, y * 100, 100, 100);
      }
    }
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
    this.isDragging = true

    this.dragStart.x = this.getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x
    this.dragStart.y = this.getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y
  }

  onPointerUp() {
    this.isDragging = false
    this.initialPinchDistance = null
    this.lastZoom = this.cameraZoom
  }

  onPointerMove(e: Event) {
    if (this.isDragging) {
      this.cameraOffset.x = this.getEventLocation(e).x / this.cameraZoom - this.dragStart.x
      this.cameraOffset.y = this.getEventLocation(e).y / this.cameraZoom - this.dragStart.y
    }

    this.redraw()
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

}
