import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor() {
  }

  errorMessages: Alert[] = []

  httpError(error: {error: string}) {
    this.error(error.error);
  }

  error(error: string) {
    let alert: Alert = {text: error, is_animating: false};

    this.errorMessages.push(alert);

    this.showMessage(alert, 3000);
  }

  showMessage(alert: Alert, duration: number) {
    setTimeout(() => {
      alert.is_animating = true;

      setTimeout(() => {
        this.errorMessages.splice(0, 1);
      }, 1500);
    }, duration);
  }
}

export interface Alert {
  text: string,
  is_animating: boolean
}
