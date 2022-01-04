import {Component, OnInit} from '@angular/core';
import {Order} from "../../domain/model/data";
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {RepositoryService} from "../../data/repository/repository.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {saveAs} from "file-saver";
import {FormBuilder} from "@angular/forms";
import {combineLatest, Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";

export interface SortObject {
  sortedBy: SortedBy,
  sortedDirection: SortedDirection
}

export type SortedBy = "DEFAULT" | "NAME" | "QUANTITY" | "REQUESTEDDATE" | "INTERNALPRIORITY"
export type SortedDirection = "ASC" | "DESC"

export interface CalculatedPriority {
  max: number,
  total: number
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent extends SubscriberContextComponent implements OnInit {

  sortedBy = ["DEFAULT", "NAME", "QUANTITY", "REQUESTEDDATE", "INTERNALPRIORITY"]
  orders?: Order[]
  untouchedOrders?: Order[]
  processes?: string[]
  sortedDirection = this.fb.control("DESC")

  filter = this.fb.control("DEFAULT")


  constructor(
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    private router: Router,
    private repo: RepositoryService
  ) {
    super()
  }

  translateSortedByValue(s: string): string {
    if (s === "NAME") return "Nome prodotto"
    if (s === "QUANTITY") return "Quantità richiesta"
    if (s === "REQUESTEDDATE") return "Data richiesta"
    if (s === "INTERNALPRIORITY") return "Priorità interna"
    else return "Predefinito"

  }

  getCalculatedPriority(it: Order): CalculatedPriority {
    const prios = it.internalOrders.map(ti => ti.priority ? ti.priority : 0)
    const res: CalculatedPriority = {
      max: Math.max(...prios),
      total: prios.reduce((a, b) => a + b, 0)
    }
    return res
  }

  ngOnInit(): void {

    this.subscribeWithContext(
      this.getFilterAsObservable(),
      it => {
        console.log(it)
        if (this.orders && this.untouchedOrders) {
          if (it.sortedBy === "DEFAULT") {
            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => a.creationTime! < b.creationTime! ? 1 : -1) :
              this.untouchedOrders.sort((a, b) => a.creationTime! < b.creationTime! ? -1 : 1)
          } else if (it.sortedBy === "NAME") {
            it.sortedDirection === "DESC" ? this.orders.sort((a, b) => a.product < b.product ? 1 : -1) :
              this.orders.sort((a, b) => a.product < b.product ? -1 : 1)
          } else if (it.sortedBy === "QUANTITY") {
            it.sortedDirection === "DESC" ? this.orders.sort((a, b) => a.requestedQuantity < b.requestedQuantity ? 1 : -1) :
              this.orders.sort((a, b) => a.requestedQuantity < b.requestedQuantity ? -1 : 1)

          } else if (it.sortedBy === "REQUESTEDDATE") {
            it.sortedDirection === "DESC" ? this.orders.sort((a, b) => a.requestedDate < b.requestedDate ? 1 : -1) :
              this.orders.sort((a, b) => a.requestedDate < b.requestedDate ? -1 : 1)

          } else if (it.sortedBy === "INTERNALPRIORITY") {

            it.sortedDirection === "DESC" ? this.orders.sort((a, b) => {
              const first = this.getCalculatedPriority(a)
              const second = this.getCalculatedPriority(b)
              if (first.max === second.max) return first.total < second.total ? 1 : -1
              else return first.max < second.max ? 1 : -1

            }) : this.orders.sort((a, b) => {
              const first = this.getCalculatedPriority(a)
              const second = this.getCalculatedPriority(b)
              if (first.max === second.max) return first.total < second.total ? -1 : 1
              else return first.max < second.max ? -1 : 1
            })
          }
        }
      }
    )


    this.subscribeWithContext(
      this.repo.getAllProcesses(), value => {
        this.processes = value
      }
    )
    this.subscribeWithContext(this.repo.getAllOrders(), value => {
        this.untouchedOrders = value
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
          this.untouchedOrders = value
          this.orders = value

        }
      )
    })
  }

  getFilterAsObservable(): Observable<SortObject> {
    return combineLatest(
      [this.filter.valueChanges.pipe(startWith("DEFAULT")), this.sortedDirection.valueChanges.pipe(startWith("DESC"))]
    ).pipe(
      map(([by, dir]) => {
          const res: SortObject = {sortedBy: by, sortedDirection: dir}
          return res
        }
      )
    )
  }


}
