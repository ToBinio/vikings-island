import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() { }

  animation: boolean = false;
  errorMessages: string[] = []

  error(errorMessages: string[]) {
    this.errorMessages = errorMessages;

    for (let errorMessage of errorMessages) {
      this.showMessage(errorMessage, 3000);
    }
  }

  showMessage(message: string, duration: number) {
    setTimeout(() => {
      this.animation = true;

      setTimeout(() => {
        this.hideMessage();
      }, 1500);
    }, duration);
  }

  hideMessage() {
    this.errorMessages.splice(0, 1);
    this.animation = false;
  }
}
