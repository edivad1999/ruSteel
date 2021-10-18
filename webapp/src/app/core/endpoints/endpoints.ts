import {Inject, Injectable} from '@angular/core';
import {DOCUMENT} from "@angular/common";

@Injectable({
  providedIn: 'root'
})
export class Endpoints {
  httpProtocol = 'http';
  wsProtocol = 'ws';
  hostname = 'localhost';
  port = 42069;
  basePath = 'api';

  constructor(@Inject(DOCUMENT) private document: Document) {
    if (document.location.hostname !== "localhost") {
      this.hostname = "rusteel.herokuapp.com"
      this.httpProtocol = 'https'
      this.port = 80

    }

  }

  verifyTokenUrl(): string {
    return this.buildUrl('verifyToken');
  }

  loginWithEmailAndPasswordUrl(): string {
    return this.buildUrl('login');
  }

  getOrderByIdUrl(id: string) {
    return this.buildUrl(`order/id?id=${id}`);
  }

  getAllOrdersUrl() {
    return this.buildUrl('order/all');
  }

  removeOrderbyIdUrl(id: string) {
    return this.buildUrl(`order/remove?id=${id}`);
  }

  editOrderbyIdUrl(id: string) {
    return this.buildUrl(`order/edit?id=${id}`);
  }

  newOrderUrl() {
    return this.buildUrl(`order/new`);
  }

  getAllProcessesUrl() {
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

  getPdfUrl(id: string) {
    return this.buildUrl(`order/qr?id=${id}`);
  }

  uploadBackupDBUrl() {
    return this.buildUrl('backup/restore');
  }

  changePasswordUrl() {
    return this.buildUrl('admin/changePassword');
  }

  getCompletionUrl() {
    return this.buildUrl('completion/all');
  }
}
