import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Order} from "../../../domain/model/data";
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
