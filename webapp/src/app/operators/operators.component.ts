import {Component, OnInit} from '@angular/core';
import {SubscriberContextComponent} from "../utils/subscriber-context.component";
import {RepositoryService} from "../data/repository/repository.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {OperatorData, OperatorRequest} from "../domain/model/data";
import {MatDialog} from "@angular/material/dialog";
import {PasswordDialogComponent} from "./dialogs/password-dialog/password-dialog.component";
import {UsernamePasswordDialogComponent} from "./dialogs/username-password-dialog/username-password-dialog.component";

@Component({
  selector: 'app-operators',
  templateUrl: './operators.component.html',
  styleUrls: ['./operators.component.css']
})

export class OperatorsComponent extends SubscriberContextComponent implements OnInit {

  operators: OperatorData [] = []

  constructor(private repo: RepositoryService,
              private snackbar: MatSnackBar,
              private dialog: MatDialog
  ) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.repo.getOperators(),
      it => this.operators = it
    )

  }

  changeOperatorPassword(operator: string, newPassword: string) {
    this.subscribeWithContext(
      this.repo.changeOperatorPass({
        username: operator,
        new: btoa(newPassword)
      }), it => {
        if (it) {
          this.snackbar.open("Password modificata", "chiudi")
        } else {
          this.snackbar.open("Problema nella modifica", "chiudi")

        }
      }
    )
  }

  newOperator(username: string, password: string) {
    this.subscribeWithContext(
      this.repo.newOperator({
        username: username,
        password: btoa(password)
      }), it => {
        if (it) {
          this.updateList()
          this.snackbar.open("Operatore creato", "chiudi")
        } else {
          this.snackbar.open("Problema nella creazione, l'operatore esiste già?", "chiudi")

        }
      }
    )
  }

  updateList() {
    this.subscribeWithContext(
      this.repo.getOperators(),
      it => this.operators = it
    )
  }

  removeOperator(username: string) {
    this.subscribeWithContext(
      this.repo.getOperatorOrders(username), it => {

        let hasIncompleteOrders = false
        it.forEach(ti => ti.internalOrders.forEach(value => {
          if (value.endDate === null) {
            hasIncompleteOrders = true
          }
        }))
        if (!hasIncompleteOrders) {
          this.subscribeWithContext(
            this.repo.removeOperator(username),
            response => {
              if (response) {
                this.snackbar.open("Operatore rimosso", "chiudi")
                this.updateList()
              } else this.snackbar.open("Qualcosa è andato storto", "chiudi")
            }
          )
        } else {
          this.snackbar.open("Non puoi eliminare un operatore se ha ancora degli ordini assegnati non terminati", "chiudi")

        }
      }
    )
  }

  openPasswordInput(username: string) {
    const ref = this.dialog.open(PasswordDialogComponent, {panelClass: "app-full-bleed-dialog"})
    this.subscribeWithContext(
      ref.afterClosed(),
      value => {
        if (value) {
          this.changeOperatorPassword(username, value)
        }
      }
    )
  }

  openUsernamePasswordInput() {
    const ref = this.dialog.open(UsernamePasswordDialogComponent, {data: this.operators.map(it => it.name), panelClass: "app-full-bleed-dialog"})
    this.subscribeWithContext(
      ref.afterClosed(),
      (value: OperatorRequest | null) => {
        if (value) {
          this.newOperator(value.username, value.password)
        }
      }
    )
  }
}
