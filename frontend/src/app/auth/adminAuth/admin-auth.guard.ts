import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthService} from "../loginAuth/auth.service";
import {AdminAuthService} from "./admin-auth.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private adminAuthService: AdminAuthService, private router: Router) {
  };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    console.log('CanActivate called for isAdmin');
    let isAdmin = this.adminAuthService.isAuthenticated();

    if (isAdmin) {
      return true
    } else {
      this.router.navigate(['/']);
      return false
    }
  }
}
