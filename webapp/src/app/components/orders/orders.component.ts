import {Component, OnInit} from '@angular/core';
import {Order} from "../../domain/model/data";
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {RepositoryService} from "../../data/repository/repository.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {saveAs} from "file-saver";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent extends SubscriberContextComponent implements OnInit {
  orders?: Order[]
  processes?: string[]

  constructor(
    private snackbar: MatSnackBar,
    private router: Router,
    private repo: RepositoryService
  ) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.repo.getAllProcesses(), value => {
        this.processes = value
      }
    )
    this.subscribeWithContext(this.repo.getAllOrders(), value => {
        this.orders = value

      }
    )
  }
  downloadExcel() {
    this.subscribeWithContext(
      this.repo.getExcel(),
      value => {
        saveAs(value, `fabbisogni.xlsx`)
      }
    )
  }
  goToNewOrder() {
    this.router.navigateByUrl('/orders/new')
  }

  deleteById(id: string) {
    this.subscribeWithContext(this.repo.removeOrderbyId(id), value => {
      if (value) {
        this.snackbar.open("Cancellato correttamente", "chiudi")
      }
      this.subscribeWithContext(this.repo.getAllOrders(), value => {
          this.orders = value

        }
      )
    })
  }
}
