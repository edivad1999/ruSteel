import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InternalOrder, Order} from "../../../domain/model/data";
import {Router} from "@angular/router";
import {saveAs} from "file-saver";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {RepositoryService} from "../../../data/repository/repository.service";
import {catchError} from "rxjs/operators";
import {of} from "rxjs";
import {MatSelectChange} from "@angular/material/select";

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.css']
})
export class SingleOrderComponent extends SubscriberContextComponent implements OnInit {
  @Input() order!: Order
  @Input() fromList!: Boolean
  @Output() deleteId: EventEmitter<string> = new EventEmitter<string>()
  changedPrios: string[] = []

  constructor(private router: Router, private repo: RepositoryService) {
    super()
  }

  getOrderDate(instant: number) {
    return new Date(instant).toLocaleDateString()

  }

  getStatus(internal: InternalOrder): string {
    if (internal.endDate) {
      return "Completato"
    } else if (internal.startDate && !internal.endDate) {
      return "In lavorazione"
    } else {
      return "Non iniziato"
    }
  }

  getStatusColor(internal: InternalOrder): string {
    if (internal.endDate) {
      return "#46a35e"
    } else if (internal.startDate && !internal.endDate) {
      return "#308af0"
    } else {
      return "#000000"
    }
  }

  ngOnInit(): void {
  }

  getEditUrl(id: string) {
    return ("/orders/edit/" + id)
  }

  downloadPdf(id: string) {
    this.subscribeWithContext(
      this.repo.getPdf(id),
      value => {
        saveAs(value, `commessa${id}.pdf`)
      }
    )
  }

  endProduction(internal: InternalOrder) {
    const old = internal.endDate
    internal.endDate = Date.now()
    this.subscribeWithContext(
      this.repo.editOrderbyId(this.order.id, this.order).pipe(
        catchError(err => {
          internal.endDate = old
          return of(true)
        })
      )
    )
  }

  startProduction(internal: InternalOrder) {
    const old = internal.startDate
    internal.startDate = Date.now()
    this.subscribeWithContext(
      this.repo.editOrderbyId(this.order.id, this.order).pipe(
        catchError(err => {
          internal.startDate = old
          return of(true)
        })
      )
    )
  }

  resetProduction(internal: InternalOrder) {
    const oldStart = internal.startDate
    const oldEnd = internal.endDate
    internal.startDate = null
    internal.endDate = null
    this.subscribeWithContext(
      this.repo.editOrderbyId(this.order.id, this.order).pipe(
        catchError(err => {
          internal.startDate = oldStart
          internal.endDate = oldEnd
          return of(true)
        })
      )
    )
  }

  setPriority(event: MouseEvent, internal: InternalOrder, value: number | null) {
    event.stopPropagation()
    const oldPriority = internal.priority
    internal.priority = value
    this.subscribeWithContext(
      this.repo.editOrderbyId(this.order.id, this.order).pipe(
        catchError(err => {
          internal.priority = oldPriority
          return of(true)
        })
      )
    )
    this.changedPrios = this.changedPrios.filter(it => it !== internal.id)

  }


}
