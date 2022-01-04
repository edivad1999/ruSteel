import {Component, Inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {OperatorRequest} from "../../../domain/model/data";

export function forbiddenUsername(users: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = users.includes(control.value)
    return forbidden ? {forbiddenUsername: {value: control.value}} : null;
  };
}

@Component({
  selector: 'app-username-password-dialog',
  templateUrl: './username-password-dialog.component.html',
  styleUrls: ['./username-password-dialog.component.css']
})
export class UsernamePasswordDialogComponent implements OnInit {


  username = this.fb.control("", [Validators.required, forbiddenUsername(this.data)])
  password = this.fb.control("", [Validators.required, Validators.minLength(6)])


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string[],
    private fb: FormBuilder,
    private ref: MatDialogRef<UsernamePasswordDialogComponent>
  ) {
  }

  ngOnInit(): void {
  }

  exit(b: boolean) {
    if (b) {
      if (this.password.valid && this.username.valid) {
        let res: OperatorRequest = {
          username: this.username.value,
          password: this.password.value
        }
        this.ref.close(res)

      } else {
        this.ref.close(null)

      }
    }
  }
}
