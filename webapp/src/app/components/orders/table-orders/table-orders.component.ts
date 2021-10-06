import {Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../domain/model/data";
import {MatTable, MatTableDataSource} from "@angular/material/table";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {MatSnackBar} from "@angular/material/snack-bar";
import {RepositoryService} from "../../../data/repository/repository.service";

export interface OrderTableRow {
  id: number | null;
  product: string | null;
  requestedDate: number | null;
  requestedQuantity: number | null;
  //
  productCode: string | null;
  productQuantity: number | null;
  rawCode: string | null;
  rawQuantity: number | null;
  operator: string | null;
  processes: string[] | null
  externalTreatments: string | null;
  commission: string | null;
  client: string | null;
  clientOrderCode: string | null;
  startDate: number | null;
  endDate: number | null;
  expectedEndDate: number | null;
}

@Component({
  selector: 'app-table-orders',
  templateUrl: './table-orders.component.html',
  styleUrls: ['./table-orders.component.css']
})
export class TableOrdersComponent extends SubscriberContextComponent implements OnInit {
  @Input() orders!: Order[]

  orderTable: OrderTableRow[] = []
  datasource = new MatTableDataSource<OrderTableRow>()
  @Input() processes: string[] = []
  displayedColumns: string[] = []
  arr1 = ['product',
    'requestedDate',
    'requestedQuantity',
    'productCode',
    'productQuantity',
    'rawCode',
    'rawQuantity',
    'operator', 'processes',
    'externalTreatments']
  arr2 = [
    'commission',
    'client',
    'clientOrderCode',
    'startDate',
    'endDate',
    'expectedEndDate',
    'azioni'
  ]


  constructor(
    private snackbar: MatSnackBar,
    private repo: RepositoryService
  ) {
    super()
    this.displayedColumns = this.arr1.concat(this.arr2)
    console.log(this.displayedColumns)

  }

  initDataStructure() {
    this.orderTable = []
    for (const order of this.orders) {
      this.orderTable.push(
        {
          id: order.id,
          product: order.product,
          requestedDate: order.requestedDate,
          requestedQuantity: order.requestedQuantity,

          productCode: order.internalOrders[0].productCode,
          productQuantity: order.internalOrders[0].productQuantity,
          rawCode: order.internalOrders[0].rawCode,
          rawQuantity: order.internalOrders[0].rawQuantity,
          operator: order.internalOrders[0].operator,
          externalTreatments: order.internalOrders[0].externalTreatments,
          processes: order.internalOrders[0].processes,

          commission: order.commission,
          client: order.client,
          clientOrderCode: order.clientOrderCode,
          startDate: order.startDate,
          endDate: order.endDate,
          expectedEndDate: order.expectedEndDate

        }
      )
      order.internalOrders.slice(1).forEach(
        internal => {
          this.orderTable.push(
            {
              id: null,
              product: null,
              requestedDate: null,
              requestedQuantity: null,

              productCode: internal.productCode,
              productQuantity: internal.productQuantity,
              rawCode: internal.rawCode,
              rawQuantity: internal.rawQuantity,
              operator: internal.operator,
              externalTreatments: internal.externalTreatments,
              processes: internal.processes,

              commission: null,
              client: null,
              clientOrderCode: null,
              startDate: null,
              endDate: null,
              expectedEndDate: null,

            }
          )

        }
      )
    }
    this.datasource.data = this.orderTable
  }

  ngOnInit(): void {

    this.initDataStructure()

    console.log(this.orderTable)
  }

  getOrderDate(instant: number) {
    return new Date(instant).toLocaleDateString()
  }

  getEditUrl(id: number) {
    return ("/orders/edit/" + id)
  }

  deleteById(id: number, table: MatTable<any>) {
    this.subscribeWithContext(this.repo.removeOrderbyId(id), value => {
      if (value) {
        this.snackbar.open("Cancellato correttamente", "chiudi")
      }
      this.subscribeWithContext(this.repo.getAllOrders(), value => {
          this.orders = value
          this.initDataStructure()


        }
      )
    })
  }

  convertColumnName(column: string) {
    if (column === 'product') {
      return 'Prodotto'
    } else if (column === 'requestedDate') {
      return 'Data richiesta'

    } else if (column === 'requestedQuantity') {
      return 'Quantità richiesta'

    } else if (column === 'productCode') {
      return 'Codice interno'
    } else if (column === 'productQuantity') {
      return 'Quantità interno'

    } else if (column === 'rawCode') {
      return 'Codice grezzo'

    } else if (column === 'rawQuantity') {
      return 'Quantità grezzo'

    } else if (column === 'operator') {
      return 'Operatore'

    } else if (column === 'processes') {
      return 'Lavorazioni'

    } else if (column === 'externalTreatments') {
      return 'Lavorazioni Est'

    } else if (column === 'commission') {
      return 'Commessa'

    } else if (column === 'client') {
      return 'Cliente'

    } else if (column === 'clientOrderCode') {
      return 'Codice Cliente'

    } else if (column === 'startDate') {
      return 'D.Inizio'

    } else if (column === 'endDate') {
      return 'D.Fine'

    } else if (column === 'expectedEndDate') {
      return 'D.Fine stimata'

    } else  {
      return 'azioni'

    }
  }
}
