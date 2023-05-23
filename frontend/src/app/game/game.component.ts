import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {


  cameraOffset = {x: window.innerWidth / 2, y: window.innerHeight / 2}
  cameraZoom = 1
  MAX_ZOOM = 5
  MIN_ZOOM = 0.1
  SCROLL_SENSITIVITY = 0.01

  @ViewChild('gameCanvas', {static: true})
  canvas!: ElementRef<HTMLCanvasElement>;

  constructor() {
  }

  ngOnInit(): void {

    let canvas = this.canvas.nativeElement;

    canvas.addEventListener('mousedown', (e) => this.onPointerDown(e))
    canvas.addEventListener('touchstart', (e) => this.handleTouch(e, (e) => this.onPointerDown(e)))
    canvas.addEventListener('mouseup', (e) => this.onPointerUp(e))
    canvas.addEventListener('touchend', (e) => this.handleTouch(e, (e) => this.onPointerUp(e)))
    canvas.addEventListener('mousemove', (e) => this.onPointerMove(e))
    canvas.addEventListener('touchmove', (e) => this.handleTouch(e, (e) => this.onPointerMove(e)))

    this.canvas.nativeElement.addEventListener('DOMMouseScroll', (e) => {
      // @ts-ignore
      let scroll = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

      this.adjustZoom(scroll * this.SCROLL_SENSITIVITY, 1)

      e.preventDefault()
      return false;
    }, false);
    this.canvas.nativeElement.addEventListener('mousewheel', (e) => {

      // @ts-ignore
      let scroll = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

      this.adjustZoom(scroll * this.SCROLL_SENSITIVITY, 1)
      e.preventDefault()
      return false;
    }, false);

    this.redraw();
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

  getEventLocation(e: any) {
    if (e.touches && e.touches.length == 1) {
      return {x: e.touches[0].clientX, y: e.touches[0].clientY}
    } else {
      return {x: e.clientX, y: e.clientY}
    }
  }

  isDragging = false
  dragStart = {x: 0, y: 0}

  onPointerDown(e: Event) {
    this.isDragging = true

    this.dragStart.x = this.getEventLocation(e).x / this.cameraZoom - this.cameraOffset.x
    this.dragStart.y = this.getEventLocation(e).y / this.cameraZoom - this.cameraOffset.y
  }

  onPointerUp(e: Event) {
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

  initialPinchDistance: null | number = null
  lastZoom = this.cameraZoom

  handlePinch(e: any) {
    e.preventDefault()

    let touch1 = {x: e.touches[0].clientX, y: e.touches[0].clientY}
    let touch2 = {x: e.touches[1].clientX, y: e.touches[1].clientY}

    // This is distance squared, but no need for an expensive sqrt as it's only used in ratio
    let currentDistance = (touch1.x - touch2.x) ** 2 + (touch1.y - touch2.y) ** 2

    if (this.initialPinchDistance == null) {
      this.initialPinchDistance = currentDistance
    } else {
      this.adjustZoom(null, currentDistance / this.initialPinchDistance)
    }
  }

  adjustZoom(zoomAmount: number | null, zoomFactor: number) {
    if (!this.isDragging) {
      if (zoomAmount) {
        this.cameraZoom += zoomAmount
      } else if (zoomFactor) {
        this.cameraZoom = zoomFactor * this.lastZoom
      }

      this.cameraZoom = Math.min(this.cameraZoom, this.MAX_ZOOM)
      this.cameraZoom = Math.max(this.cameraZoom, this.MIN_ZOOM)

      this.redraw()
    }
  }

}
