import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {MatDialogRef} from "@angular/material/dialog";



@Component({
  selector: 'app-password-dialog',
  templateUrl: './password-dialog.component.html',
  styleUrls: ['./password-dialog.component.css']
})
export class PasswordDialogComponent implements OnInit {


  password = this.fb.control("", [Validators.required, Validators.minLength(6)])

  constructor(private fb: FormBuilder,
              private ref: MatDialogRef<PasswordDialogComponent>
  ) {
  }

  ngOnInit(): void {
  }

  exit(b: boolean) {
    if (b) {
      if (this.password.valid)
        this.ref.close(this.password.value)

    } else {
      this.ref.close(null)

    }
  }

}
