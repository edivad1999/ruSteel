import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHandlerService} from '../../utils/jwt-handler.service';
import {Endpoints} from '../endpoints/endpoints';
import {HttpClient} from '@angular/common/http';
import {AuthTokenData} from '../../data/requests';
import {Order} from "../../domain/model/data";


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

  getOrderById(id: number): Observable<Order> {
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

  removeOrderbyId(id: number): Observable<boolean> {
    return this.httpClient.get(
      this.endpoints.removeOrderbyIdUrl(id),
      {observe: "response"}
    ).pipe(
      map(value => value.status === 200)
    )
  }

  editOrderbyId(id: number, order: Order): Observable<Order> {
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

  newOrder(order: Order): Observable<Order> {
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

  verifyToken(): Observable<boolean> {
    return this.httpClient.get<string>(this.endpoints.verifyTokenUrl(), {observe: 'response'}).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    );
  }
}
