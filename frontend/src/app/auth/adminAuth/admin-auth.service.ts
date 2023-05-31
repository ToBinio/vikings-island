import {Injectable} from '@angular/core';
import {AuthService} from "../loginAuth/auth.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {

  isAdmin = false;

  constructor(private loginAuthService: AuthService) {
    if (loginAuthService.isAuthenticated()) {
      if (true) {
        this.isAdmin = true;
      }
    }
  }

  isAuthenticated() {
    return this.isAdmin;
  }
}
