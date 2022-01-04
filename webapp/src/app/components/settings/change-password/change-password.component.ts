import {Component, OnInit} from '@angular/core';
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {RepositoryService} from "../../../data/repository/repository.service";
import {AbstractControl, FormControl, FormGroup, ValidationErrors, Validators} from "@angular/forms";
import {catchError, tap} from "rxjs/operators";
import {of} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent extends SubscriberContextComponent implements OnInit {

  changingPassword = false;
  oldPasswordControl = new FormControl('',
    [
      Validators.required,
      Validators.minLength(6)
    ]);
  newPasswordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6)
  ]);
  newPasswordMatchControl = new FormControl('', [
    Validators.required,
    ChangePasswordComponent.passwordConfirming
  ]);
  changePasswordFormGroup = new FormGroup(
    {
      oldPassword: this.oldPasswordControl,
      newPassword: this.newPasswordControl,
      newPasswordMatch: this.newPasswordMatchControl
    }
  );


  constructor(
    private snackbar: MatSnackBar,
    private repo: RepositoryService) {
    super()
  }

  ngOnInit(): void {
  }

  public static passwordConfirming(c: AbstractControl): null | ValidationErrors {
    const p = c?.parent?.get('newPassword')?.value as string | undefined;
    return p === c.value ? null : {passwordNotEquals: true};
  }

  changePassword(): void {
    this.changingPassword = true;
    this.subscribeWithContext(
      this.repo.changePassword(
        this.oldPasswordControl.value,
        this.newPasswordControl.value
      ).pipe(
        catchError(err => {
          console.error(err);
          return of(false);
        }),
        tap(isSuccess => {
          this.changingPassword = false;
          if (!isSuccess) {
            this.snackbar.open('Ops! qualcosa è andato storto, hai inserito correttamente la password precedente?...', 'chiudi');
          } else {
            this.snackbar.open('Password cambiata con successo', 'chiudi');
            this.newPasswordControl.setValue('');
            this.newPasswordControl.markAsUntouched();
            this.newPasswordMatchControl.setValue('');
            this.newPasswordMatchControl.markAsUntouched();
            this.oldPasswordControl.setValue('');
            this.oldPasswordControl.markAsUntouched();
          }
        })
      )
    );
  }

}
