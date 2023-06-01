import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import {AdminAuthService} from "./admin-auth.service";

@Injectable({
  providedIn: 'root'
})
export class AdminAuthGuard implements CanActivate {

  constructor(private adminAuthService: AdminAuthService, private router: Router) {
  };

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean | Observable<boolean> {

    if (this.adminAuthService.isAuth == undefined) {
      return new Observable((subscriber) => {
        this.adminAuthService.isAuthenticated().subscribe({
          next: res => {
            subscriber.next(res);

            console.log("ans: " + res);

            if (!res) {
              this.router.navigate(['/games']);
            }
          },
          error: res => {
            subscriber.next(false)
            this.router.navigate(['/login']);
          }
        })
      })
    }

    console.log("chached: " + this.adminAuthService.isAuth);

    if (this.adminAuthService.isAuth) {
      return true
    } else {
      this.router.navigate(['/login']);
      return false
    }
  }
}
