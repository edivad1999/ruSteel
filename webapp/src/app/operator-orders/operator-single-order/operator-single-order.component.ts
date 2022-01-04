import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {EditProductionDate, InternalOrder, Order} from "../../domain/model/data";
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {RepositoryService} from "../../data/repository/repository.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-operator-single-order',
  templateUrl: './operator-single-order.component.html',
  styleUrls: ['./operator-single-order.component.css']
})
export class OperatorSingleOrderComponent extends SubscriberContextComponent implements OnInit {
  @Input() order!: Order
  @Output() requestDone: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(
    private repo: RepositoryService,
    private snackbar: MatSnackBar
  ) {
    super()
  }

  ngOnInit(): void {
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

  resetProduction(internal: InternalOrder) {
    const internalRequest: EditProductionDate = {
      id: internal.id,
      action: "reset"
    }
    this.sendProductionRequest(internalRequest, internal)

  }

  startProduction(internal: InternalOrder) {
    const internalRequest: EditProductionDate = {
      id: internal.id,
      action: "start"
    }
    this.sendProductionRequest(internalRequest, internal)
  }

  endProduction(internal: InternalOrder) {
    const internalRequest: EditProductionDate = {
      id: internal.id,
      action: "end"
    }
    this.sendProductionRequest(internalRequest, internal)
  }

  sendProductionRequest(internalRequest: EditProductionDate, internal: InternalOrder) {
    this.subscribeWithContext(
      this.repo.editInternalOrderState(internalRequest),
      action => {
        if (action) {
          this.snackbar.open(this.translateAction(internalRequest.action) + " effettuato con successo!", "chiudi")
          this.order.internalOrders = this.order.internalOrders.map(it => {
            if (it.id === action.id) {
              return action
            } else return it
          })
          this.requestDone.emit(true)
        } else {
          this.snackbar.open("Errore nella richiesta", "chiudi")
        }
      }
    )
  }

  translateAction(s: string) {
    if (s === "end") return "Completamento "
    else if (s === "start") return "Avvio "
    else return "Reset"
  }
}
