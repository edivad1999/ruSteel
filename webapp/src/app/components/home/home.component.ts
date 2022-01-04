import {Component, OnInit} from '@angular/core';
import {RepositoryService} from "../../data/repository/repository.service";
import {Role} from "../../domain/model/data";
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent extends SubscriberContextComponent implements OnInit {
  role?: Role
  user = Role.USER
  admin = Role.ADMIN

  constructor(public repo: RepositoryService) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.repo.myRole(), s => {
        this.role = s
      }
    )
  }

}
