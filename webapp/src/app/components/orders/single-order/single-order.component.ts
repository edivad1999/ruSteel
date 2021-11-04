import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {InternalOrder, Order} from "../../../domain/model/data";
import {Router} from "@angular/router";
import {saveAs} from "file-saver";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {RepositoryService} from "../../../data/repository/repository.service";

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.css']
})
export class SingleOrderComponent extends SubscriberContextComponent implements OnInit {
  @Input() order!: Order
  @Input() fromList!: Boolean
  @Output() deleteId: EventEmitter<string> = new EventEmitter<string>()

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
}
