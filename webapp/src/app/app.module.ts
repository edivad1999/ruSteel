import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {AppComponent} from './app.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatCardModule} from '@angular/material/card';
import {MatToolbarModule} from '@angular/material/toolbar';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatListModule} from '@angular/material/list';
import {LoginComponent} from './login/login.component';
import {AppRoutingModule} from './app-routing.module';
import {MatRippleModule} from '@angular/material/core';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatInputModule} from '@angular/material/input';
import {LogoutComponent} from './logout/logout.component';
import {AuthInterceptor} from './core/auth.interceptor';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {CentralColumnModule} from './utils/central-column/central-column.module';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {HomeComponent} from './components/home/home.component';
import {OrdersComponent} from './components/orders/orders.component';
import {NewOrderComponent} from './components/orders/new-order/new-order.component';
import {MatStepperModule} from "@angular/material/stepper";
import {SingleOrderComponent} from './components/orders/single-order/single-order.component';
import {MatTabsModule} from "@angular/material/tabs";
import {TableOrdersComponent} from './components/orders/table-orders/table-orders.component';
import {SettingsComponent} from './components/settings/settings.component';
import {ManageBackupsComponent} from "./components/settings/manage-backups/manage-backups.component";
import {RestoreDialogComponent} from "./components/settings/manage-backups/restore-dialog/restore-dialog.component";
import {ChangePasswordComponent} from './components/settings/change-password/change-password.component';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {ZXingScannerModule} from "@zxing/ngx-scanner";
import {QrComponent} from './components/qr/qr.component';
import {MatMenuModule} from "@angular/material/menu";
import { ProcessesComponent } from './components/processes/processes.component';
import {MatChipsModule} from "@angular/material/chips";
import { OperatorsComponent } from './operators/operators.component';
import { OperatorOrdersComponent } from './operator-orders/operator-orders.component';
import { OperatorSingleOrderComponent } from './operator-orders/operator-single-order/operator-single-order.component';
import { UsernamePasswordDialogComponent } from './operators/dialogs/username-password-dialog/username-password-dialog.component';
import { PasswordDialogComponent } from './operators/dialogs/password-dialog/password-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LogoutComponent,
    HomeComponent,
    OrdersComponent,
    NewOrderComponent,
    SingleOrderComponent,
    TableOrdersComponent,
    SettingsComponent,
    ManageBackupsComponent,
    RestoreDialogComponent,
    ChangePasswordComponent,
    QrComponent,
    ProcessesComponent,
    OperatorsComponent,
    OperatorOrdersComponent,
    OperatorSingleOrderComponent,
    UsernamePasswordDialogComponent,
    PasswordDialogComponent
  ],
    imports: [
        BrowserModule,
        MatFormFieldModule,
        MatButtonModule,
        MatSidenavModule,
        HttpClientModule,
        MatCardModule,
        MatToolbarModule,
        BrowserAnimationsModule,
        MatListModule,
        AppRoutingModule,
        MatRippleModule,
        MatIconModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatInputModule,
        MatDialogModule,
        MatTableModule,
        MatSortModule,
        MatButtonToggleModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatProgressBarModule,
        CentralColumnModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatStepperModule,
        MatTabsModule,
        MatAutocompleteModule,
        ZXingScannerModule,
        MatMenuModule,
        MatChipsModule,
        FormsModule
    ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
