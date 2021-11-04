import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHandlerService} from '../../utils/jwt-handler.service';
import {Endpoints} from '../endpoints/endpoints';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthTokenData} from '../../data/requests';
import {Completion, CreateOrderRequest, InternalOrder, Order, PasswordChangeRequest} from "../../domain/model/data";


@Injectable({
  providedIn: 'root'
})
export class DatasourceService {

  constructor(
    private endpoints: Endpoints,
    private jwtHandler: JwtHandlerService,
    private httpClient: HttpClient) {
  }

  loginWithEmailAndPassword(username: string, password: string): Observable<AuthTokenData> {

    return this.httpClient.post<AuthTokenData>(
      this.endpoints.loginWithEmailAndPasswordUrl(),
      {username: btoa(username), password: btoa(password)}/*,{headers}*/
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.httpClient.get(
      this.endpoints.getOrderByIdUrl(id),
      {observe: "response"}
    ).pipe(
      map(value => value.body as Order)
    )
  }

  getAllOrders(): Observable<Order[]> {
    return this.httpClient.get(
      this.endpoints.getAllOrdersUrl(),
      {observe: "response"}
    ).pipe(
      map(value => value.body as Order[])
    )
  }

  removeOrderbyId(id: string): Observable<boolean> {
    return this.httpClient.get(
      this.endpoints.removeOrderbyIdUrl(id),
      {observe: "response"}
    ).pipe(
      map(value => value.status === 200)
    )
  }

  editOrderbyId(id: string, order: Order): Observable<Order> {
    return this.httpClient.post(
      this.endpoints.editOrderbyIdUrl(id),
      order,
      {observe: "response"}
    ).pipe(
      map(
        response => response.body as Order
      )
    )
  }

  newOrder(order: CreateOrderRequest): Observable<Order> {
    return this.httpClient.post(
      this.endpoints.newOrderUrl(),
      order,
      {observe: "response"}
    ).pipe(
      map(
        response => response.body as Order
      )
    )
  }

  getAllProcesses(): Observable<string[]> {
    return this.httpClient.get(
      this.endpoints.getAllProcessesUrl(),
      {observe: "response"}
    ).pipe(
      map(value => value.body as string[])
    )
  }

  verifyToken(): Observable<boolean> {
    return this.httpClient.get<string>(this.endpoints.verifyTokenUrl(), {observe: 'response'}).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  uploadBackupDB(file: File) {
    const r = new FormData();
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data');
    r.append(file.name, file, file.name);
    return this.httpClient.post(
      this.endpoints.uploadBackupDBUrl(),
      r,
      {
        observe: 'response',
        headers
      }
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }

  changePassword(old: string, newp: string) {
    const req: PasswordChangeRequest = {
      old: old,
      new: newp
    }
    return this.httpClient.post(
      this.endpoints.changePasswordUrl(),
      req,
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  getPdf(id: string): Observable<Blob> {
    return this.httpClient.get(this.endpoints.getPdfUrl(id), {responseType: 'arraybuffer'}).pipe(
      map((a) => new Blob([a], {type: 'octet/stream'}))
    );
  }

  getCompletion(): Observable<Completion> {
    return this.httpClient.get(this.endpoints.getCompletionUrl(), {observe: "response"}
    ).pipe(
      map(value => value.body as Completion)
    )
  }

  getInteralOrderById(id: string): Observable<InternalOrder | null> {
    return this.httpClient.get(
      this.endpoints.getInternalOrderUrl(id),
      {observe: "response"}
    ).pipe(
      catchError(err => of(null)),
      map(resp => {
        if (resp) {
          return resp.body as InternalOrder
        } else return null
      })
    )
  }

  setInternalDate(id: string, action: string, date: number): Observable<boolean> {
    return this.httpClient.post(
      this.endpoints.setInternalDateUrl(),
      {id, action, date},
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }
}
