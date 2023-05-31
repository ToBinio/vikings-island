import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AdminAuthService} from "./admin-auth.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private adminAuthService: AdminAuthService) {
  };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> {
    console.log('CanActivate called for isAdmin');
    return this.adminAuthService.isAuthenticated();
  }
}
