import {Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../domain/model/data";

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.css']
})
export class SingleOrderComponent implements OnInit {
  @Input() order!: Order

  constructor() {
  }

  getOrderDate(instant: number) {
    return new Date(instant).toLocaleDateString()

  }

  ngOnInit(): void {
  }

}
