import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class Endpoints {
  httpProtocol = 'https';
  wsProtocol = 'ws';
  hostname = 'localhost';
  port = 80;
  basePath = 'api';

  constructor(@Inject(DOCUMENT) private document: Document) {

    this.hostname = "rusteel.herokuapp.com"
  }

  verifyTokenUrl(): string {
    return this.buildUrl('verifyToken');
  }

  loginWithEmailAndPasswordUrl(): string {
    return this.buildUrl('login');
  }

  getOrderByIdUrl(id: number) {
    return this.buildUrl(`order/id?id=${id}`);
  }

  getAllOrdersUrl() {
    return this.buildUrl('order/all');
  }

  removeOrderbyIdUrl(id: number) {
    return this.buildUrl(`order/remove?id=${id}`);
  }

  editOrderbyIdUrl(id: number) {
    return this.buildUrl(`order/edit?id=${id}`);
  }

  newOrderUrl() {
    return this.buildUrl(`order/new`);
  }
  getAllProcessesUrl(){
    return this.buildUrl(`process/all`);

  }


  protected buildUrl(finalPath: string, type: 'ws' | 'http' = 'http'): string {
    let url = `${type === 'http' ? this.httpProtocol : this.wsProtocol}://${this.hostname}`;
    url += this.port === 80 ? `` : `:${this.port}`;
    if (!this.basePath.startsWith('/')) {
      url += '/';
    }
    url += this.basePath;
    if (!finalPath.startsWith('/')) {
      url += '/';
    }
    url += finalPath;
    return url;
  }
}
