import {Component, OnInit} from '@angular/core';
import {Order} from "../../domain/model/data";
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {RepositoryService} from "../../data/repository/repository.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent extends SubscriberContextComponent implements OnInit {
  orders?: Order[]

  constructor(
    private router: Router,
    private repo: RepositoryService
  ) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(this.repo.getAllOrders(), value => {
        this.orders = value

      }
    )
  }

  goToNewOrder() {
    this.router.navigateByUrl('/orders/new')
  }
}
