import {Injectable} from '@angular/core';
import {DatasourceService} from '../../core/datasource/datasource.service';
import {Observable, of, ReplaySubject} from 'rxjs';
import {AuthState, Completion, CreateOrderRequest, EditProductionDate, InternalOrder, OperatorData, OperatorPasswordChangeRequest, OperatorRequest, Order, Role} from '../../domain/model/data';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import {AuthTokenData} from '../requests';
import {JwtHandlerService} from '../../utils/jwt-handler.service';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {
  authenticationStateFlow = new ReplaySubject<AuthState>(1);
  role = new ReplaySubject<Role>(1);


  myRole(): Observable<Role> {
    return this.datasource.myRole()
      .pipe(
        map(t => {
          this.role.next(t);
          return t
        }))


  }

  getOperatorOrders(username?: string): Observable<Order[]> {
    return this.datasource.getOperatorOrders(username)
  }

  constructor(private datasource: DatasourceService,
              private jwtHandlerService: JwtHandlerService
  ) {
    jwtHandlerService.token().subscribe(t => {
      this.authenticationStateFlow.next(t ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
    });


  }

  loginWithEmailAndPassword(username: string, password: string): Observable<boolean> {
    return this.handleLoginFlow(this.datasource.loginWithEmailAndPassword(username, password));
  }

  verifyJWTSession(): Observable<boolean> {
    return this.datasource.verifyToken().pipe(
      mergeMap(r => r ? of(r) : this.logOut().pipe(map(_ => false)))
    );
  }

  logOut(): Observable<boolean> {
    return this.jwtHandlerService.remove().pipe(
      tap(_ => {
        this.authenticationStateFlow.next('UNAUTHENTICATED');
      }),
    );
  }

  getOrderById(id: string): Observable<Order> {
    return this.datasource.getOrderById(id)
  }

  getAllOrders(): Observable<Order[]> {
    return this.datasource.getAllOrders()

  }

  removeOrderbyId(id: string): Observable<boolean> {
    return this.datasource.removeOrderbyId(id)

  }

  editOrderbyId(id: string, order: Order): Observable<Order | null> {
    return this.datasource.editOrderbyId(id, order)

  }

  newOrder(order: CreateOrderRequest): Observable<Order | null> {
    return this.datasource.newOrder(order)

  }

  getAllProcesses(): Observable<string[]> {
    return this.datasource.getAllProcesses()
  }

  private handleLoginFlow(flow: Observable<AuthTokenData>): Observable<boolean> {
    this.authenticationStateFlow.next('AUTHENTICATING');
    return flow.pipe(
      mergeMap(data => this.jwtHandlerService.store(data.jwt, data.expAt)),
      catchError(err => {
        console.error(err);
        return of(false);
      }),
      mergeMap(isTokenStored => isTokenStored ? this.datasource.verifyToken() : of(false)),
      tap((success: boolean) => {
        if (!success) {
          this.logOut();
        } else {
        }
        this.authenticationStateFlow.next(success ? 'AUTHENTICATED' : 'UNAUTHENTICATED');
      }),
      map(u => !!u)
    );
  }

  uploadBackupDB(data: File): Observable<boolean> {
    return this.datasource.uploadBackupDB(data);
  }

  changePassword(old: string, newp: string): Observable<boolean> {
    return this.datasource.changePassword(old, newp)
  }

  getCompletion(): Observable<Completion> {
    return this.datasource.getCompletion()
  }

  getPdf(id: string) {
    return this.datasource.getPdf(id)
  }

  getExcel() {
    return this.datasource.getExcel()
  }

  getInteralOrderById(id: string): Observable<InternalOrder | null> {
    return this.datasource.getInteralOrderById(id)
  }

  setInternalDate(id: string, action: string, date: number): Observable<boolean> {
    return this.datasource.setInternalDate(id, action, date);
  }

  removeProcess(value: string): Observable<boolean> {
    return this.datasource.removeProcess(value)
  }

  addProcess(value: string): Observable<boolean> {
    return this.datasource.addProcess(value)
  }

  newOperator(op: OperatorRequest): Observable<boolean> {
    return this.datasource.newOperator(op)
  }

  changeOperatorPass(op: OperatorPasswordChangeRequest): Observable<boolean> {
    return this.datasource.changeOperatorPass(op)

  }

  setOperatorInternal(id: string, operator: string): Observable<boolean> {
    return this.datasource.setOperatorInternal(id, operator)

  }

  getOperators(): Observable<OperatorData[]> {
    return this.datasource.getOperators()
  }

  removeOperator(username: string) {
    return this.datasource.removeOperator(username)
  }

  editInternalOrderState(internalRequest: EditProductionDate): Observable<InternalOrder | null> {
    return this.datasource.editInternalOrderState(internalRequest)
  }

  whoAmI():Observable<string> {
    return this.datasource.whoAmI()
  }
}
