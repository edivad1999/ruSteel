import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AuthGuard, AuthorizeRole, UnauthGuard} from './utils/guards';
import {HomeComponent} from './components/home/home.component';
import {LogoutComponent} from './logout/logout.component';
import {NewOrderComponent} from "./components/orders/new-order/new-order.component";
import {SettingsComponent} from "./components/settings/settings.component";
import {QrComponent} from "./components/qr/qr.component";
import {ProcessesComponent} from "./components/processes/processes.component";
import {Role} from "./domain/model/data";
import {OperatorsComponent} from "./operators/operators.component";

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'prefix'},
  {path: 'login', component: LoginComponent, canActivate: [UnauthGuard]},
  {path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},
  {path: 'orders/new', component: NewOrderComponent, canActivate: [AuthGuard, AuthorizeRole], data: {role: Role.ADMIN}},
  {path: 'orders/edit/:id', component: NewOrderComponent, canActivate: [AuthGuard, AuthorizeRole],data: {role: Role.ADMIN}},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'processes', component: ProcessesComponent, canActivate: [AuthGuard, AuthorizeRole],data: {role: Role.ADMIN}},
  {path: 'operators', component: OperatorsComponent, canActivate: [AuthGuard, AuthorizeRole],data: {role: Role.ADMIN}},
  {path: 'qr', component: QrComponent, canActivate: [AuthGuard]},
  {path: 'settings', component: SettingsComponent,canActivate: [AuthGuard, AuthorizeRole],data: {role: Role.ADMIN}},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
