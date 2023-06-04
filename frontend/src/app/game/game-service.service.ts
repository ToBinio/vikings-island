import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {ShipMoveRequest} from "../../../../types/ship";
import {CookieService} from "ngx-cookie-service";
import {AlertService} from "../alert-system/alert.service";
import * as fs from "fs";

@Injectable({
  providedIn: 'root'
})
export class GameServiceService {

  constructor(private cookieService: CookieService, private httpClient: HttpClient, private alertService: AlertService) { }

  driveActive: boolean = false;

}
