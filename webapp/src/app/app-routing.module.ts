import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AuthGuard, UnauthGuard} from './utils/guards';
import {HomeComponent} from './components/home/home.component';
import {LogoutComponent} from './logout/logout.component';
import {NewOrderComponent} from "./components/orders/new-order/new-order.component";

const routes: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'prefix'},
  {path: 'login', component: LoginComponent, canActivate: [UnauthGuard]},
  {path: 'logout', component: LogoutComponent, canActivate: [AuthGuard]},
  {path: 'orders/new', component: NewOrderComponent, canActivate: [AuthGuard]},
  {path: 'orders/edit/:id', component: NewOrderComponent, canActivate: [AuthGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
