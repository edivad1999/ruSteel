import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {JwtHandlerService} from '../../utils/jwt-handler.service';
import {Endpoints} from '../endpoints/endpoints';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthTokenData, SimpleStringResponse} from '../../data/requests';
import {
  Completion,
  CreateOrderRequest,
  EditProductionDate,
  InternalOrder,
  OperatorData,
  OperatorPasswordChangeRequest,
  OperatorRequest,
  Order,
  PasswordChangeRequest,
  Role
} from "../../domain/model/data";


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

  editOrderbyId(id: string, order: Order): Observable<Order | null> {
    return this.httpClient.post(
      this.endpoints.editOrderbyIdUrl(id),
      order,
      {observe: "response"}
    ).pipe(
      map(
        response => response.body as Order
      ), catchError(err => {
        console.error(err);
        return of(null);
      })
    )
  }

  newOrder(order: CreateOrderRequest): Observable<Order | null> {
    return this.httpClient.post(
      this.endpoints.newOrderUrl(),
      order,
      {observe: "response"}
    ).pipe(
      map(
        response => response.body as Order
      ),
      catchError(err => {
        console.error(err);
        return of(null);
      })
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
      old: btoa(old),
      new: btoa(newp)
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

  getExcel(): Observable<Blob> {
    return this.httpClient.get(this.endpoints.getExcelUrl(), {responseType: 'arraybuffer'}).pipe(
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

  removeProcess(value: string): Observable<boolean> {
    return this.httpClient.get(
      this.endpoints.removeProcessUrl(value),
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  addProcess(value: string) {
    return this.httpClient.get(
      this.endpoints.addProcessUrl(value),
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  newOperator(op: OperatorRequest): Observable<boolean> {
    return this.httpClient.post(
      this.endpoints.newOperatorUrl(),
      op,
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  changeOperatorPass(op: OperatorPasswordChangeRequest): Observable<boolean> {
    return this.httpClient.post(
      this.endpoints.changeOperatorPasswordUrl(),
      op,
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  setOperatorInternal(id: string, operator: string): Observable<boolean> {
    return this.httpClient.get(
      this.endpoints.setOperatorInternalUrl(id, operator),
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  getOperators(): Observable<OperatorData[]> {
    return this.httpClient.get(
      this.endpoints.getOperatorsUrl(),
      {observe: "response"}
    ).pipe(
      map(it => it.body as OperatorData[])
    )
  }

  removeOperator(username: string): Observable<boolean> {
    return this.httpClient.get(
      this.endpoints.removeOperatorUrl(username),
      {observe: "response"}
    ).pipe(
      map((response) => response.status === 200),
      catchError(err => {
        console.error(err);
        return of(false);
      })
    )
  }

  myRole(): Observable<Role> {
    return this.httpClient.get(
      this.endpoints.myRoleUrl(),
      {observe: "response"}
    ).pipe(
      map(it => {
        const role = it.body as SimpleStringResponse
        if (role.responseString === "ADMIN") return Role.ADMIN
        else return Role.USER
      })
    )
  }

  getOperatorOrders(username?: string): Observable<Order[]> {
    return this.httpClient.get(
      this.endpoints.getOperatorOrdersUrl(username),
      {observe: "response"}
    ).pipe(
      map(it => it.body as Order[]))
  }

  editInternalOrderState(internalRequest: EditProductionDate): Observable<InternalOrder | null> {
    return this.httpClient.post(
      this.endpoints.editInternalOrderStateUrl(),
      internalRequest,
      {observe: "response"}
    ).pipe(
      map(
        response => response.body as InternalOrder),
      catchError(err => {
        console.error(err);
        return of(null);
      })
    )
  }

  whoAmI(): Observable<string> {
    return this.httpClient.get(
      this.endpoints.whoAmIUrl(),
      {observe: "response"}
    ).pipe(
      map(
        response => {
          return (response.body as SimpleStringResponse).responseString
        })
    )
  }
}
