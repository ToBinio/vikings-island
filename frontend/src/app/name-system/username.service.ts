import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";

@Injectable({
  providedIn: 'root'
})
export class UsernameService {

  private names: Map<number, string> = new Map()

  constructor(private httpClient: HttpClient, private cookieService: CookieService, private alertService: AlertService) {
  }

  async getName(userId: number): Promise<string> {
    if (this.names.has(userId)) {
      return this.names.get(userId)!;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.cookieService.get("token")}`
    })

    return new Promise((resolve) => {
      this.httpClient.get<{
        name: string
      }>(`${environment.apiUrl}/user/${userId}`, {headers: headers}).subscribe({
        next: res => {
          this.names.set(userId, res.name);
          resolve(res.name);
        },
        error: err => {
          switch (err.status) {
            case 403: {
              console.error(err)
              this.alertService.error(err)
              break
            }
            default: {
              this.alertService.error(err)
              console.error("something went wrong")
            }
          }

          resolve("error! - UsernameService")
        }
      })
    })
  }
}
