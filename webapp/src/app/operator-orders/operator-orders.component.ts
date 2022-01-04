import {Component, OnInit} from '@angular/core';
import {SubscriberContextComponent} from "../utils/subscriber-context.component";
import {Order} from "../domain/model/data";
import {RepositoryService} from "../data/repository/repository.service";
import {combineLatest, Observable} from "rxjs";
import {map, startWith} from "rxjs/operators";
import {CalculatedPriority, SortObject} from "../components/orders/orders.component";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-operator-orders',
  templateUrl: './operator-orders.component.html',
  styleUrls: ['./operator-orders.component.css']
})
export class OperatorOrdersComponent extends SubscriberContextComponent implements OnInit {
  myName?: string
  orders: Order[] = []
  sortedBy = ["DEFAULT", "NAME", "QUANTITY", "REQUESTEDDATE", "INTERNALPRIORITY"]
  untouchedOrders: Order[] = []
  sortedDirection = this.fb.control("DESC")
  filter = this.fb.control("DEFAULT")

  possibleViews = ["COMPLETED", "INPROGRESS", "TOSTART"]
  viewFilters = this.fb.array([...this.possibleViews.map(it => this.fb.control(it))])

  translateViewFilters(s: string) {
    if (s === "COMPLETED") return "Completati"
    else if (s === "INPROGRESS") return "In corso"
    else return "Non iniziati"
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

  constructor(private repo: RepositoryService, private fb: FormBuilder) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.repo.whoAmI(),
      value => this.myName = value
    )
    this.subscribeWithContext(
      this.getViewFilterAsObservable(), it => {
        const useThis = Array.from(this.untouchedOrders)
        console.log(useThis)
        this.orders = useThis.filter(o =>
          o.internalOrders.filter(internal => {
            if (it.includes("COMPLETED") && internal.endDate !== null) {
              return true
            } else if (it.includes("INPROGRESS") && internal.startDate !== null && internal.endDate === null) {
              return true
            } else if (it.includes("TOSTART") && internal.startDate === null && internal.endDate === null) {
              return true
            } else return false
          }).length > 0
        ).map(o => {
          const res: Order = {
            id: o.id,
            product: o.product,
            commission: o.commission,
            client: o.client,
            clientOrderCode: o.clientOrderCode,
            requestedDate: o.requestedDate,
            requestedQuantity: o.requestedQuantity,
            internalOrders: []
          }

          res.internalOrders = o.internalOrders.filter(internal => {
            if (it.includes("COMPLETED") && internal.endDate !== null) {
              return true
            } else if (it.includes("INPROGRESS") && internal.startDate !== null && internal.endDate === null) {
              return true
            } else if (it.includes("TOSTART") && internal.startDate === null && internal.endDate === null) {
              return true
            } else return false
          })
          return res
        })
      }
    )


    this.subscribeWithContext(
      this.getFilterAsObservable(),
      it => {
        if (this.orders && this.untouchedOrders) {
          if (it.sortedBy === "DEFAULT") {
            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => a.creationTime! < b.creationTime! ? 1 : -1) :
              this.untouchedOrders.sort((a, b) => a.creationTime! < b.creationTime! ? -1 : 1)

          } else if (it.sortedBy === "NAME") {
            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => a.product < b.product ? 1 : -1) :
              this.untouchedOrders.sort((a, b) => a.product < b.product ? -1 : 1)
          } else if (it.sortedBy === "QUANTITY") {
            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => a.requestedQuantity < b.requestedQuantity ? 1 : -1) :
              this.untouchedOrders.sort((a, b) => a.requestedQuantity < b.requestedQuantity ? -1 : 1)

          } else if (it.sortedBy === "REQUESTEDDATE") {
            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => a.requestedDate < b.requestedDate ? 1 : -1) :
              this.untouchedOrders.sort((a, b) => a.requestedDate < b.requestedDate ? -1 : 1)

          } else if (it.sortedBy === "INTERNALPRIORITY") {

            it.sortedDirection === "DESC" ? this.untouchedOrders.sort((a, b) => {
              const first = this.getCalculatedPriority(a)
              const second = this.getCalculatedPriority(b)
              if (first.max === second.max) return first.total < second.total ? 1 : -1
              else return first.max < second.max ? 1 : -1

            }) : this.untouchedOrders.sort((a, b) => {
              const first = this.getCalculatedPriority(a)
              const second = this.getCalculatedPriority(b)
              if (first.max === second.max) return first.total < second.total ? -1 : 1
              else return first.max < second.max ? -1 : 1
            })
          }
        }
        this.viewFilters.disable()
        this.viewFilters.enable()
      }
    )

    this.subscribeWithContext(
      this.repo.getOperatorOrders(), it => {
        this.orders = it
        this.untouchedOrders = Array.from(it)

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

  getViewFilterAsObservable(): Observable<String[]> {
    return this.viewFilters.valueChanges
  }

  clickedChip(f: string) {
    if (this.viewFilters.controls.map(it => it.value).includes(f)) {
      this.viewFilters.removeAt(
        this.viewFilters.controls.map(it => it.value).indexOf(f)
      )

    } else {
      this.viewFilters.push(this.fb.control(f))
    }

  }

  updateList() {
    this.subscribeWithContext(
      this.repo.getOperatorOrders(), it => {
        this.orders = it
        this.untouchedOrders = it

        this.filter.disable()
        this.filter.enable()
        this.viewFilters.disable()
        this.viewFilters.enable()

      })

  }
}
