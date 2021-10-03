import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Order} from "../../../domain/model/data";
import {Router} from "@angular/router";

@Component({
  selector: 'app-single-order',
  templateUrl: './single-order.component.html',
  styleUrls: ['./single-order.component.css']
})
export class SingleOrderComponent implements OnInit {
  @Input() order!: Order
  @Input() fromList!: Boolean
  @Output() deleteId:EventEmitter<number>=new EventEmitter<number>()
  constructor(private router:Router) {
  }

  getOrderDate(instant: number) {
    return new Date(instant).toLocaleDateString()

  }

  ngOnInit(): void {
  }

  getEditUrl(id: number) {
    return ("/orders/edit/"+id)
  }
}
