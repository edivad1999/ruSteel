import {Component, OnInit} from '@angular/core';
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {RepositoryService} from "../../data/repository/repository.service";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css']
})
export class ProcessesComponent extends SubscriberContextComponent implements OnInit {
  processes: string[] = []
  newProcess = this.fb.control("", [Validators.required])

  constructor(private repo: RepositoryService, private fb: FormBuilder) {
    super()
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.repo.getAllProcesses(), response => {
        this.processes = response

      }
    )
  }

  refresh() {
    this.subscribeWithContext(
      this.repo.getAllProcesses(), response => {
        this.processes = response

      }
    )
  }

  delete(name: string) {
    this.subscribeWithContext(
      this.repo.removeProcess(name), response => {
        if (response) {
          this.refresh()
        }
      }
    )
  }


  save() {
    this.subscribeWithContext(
      this.repo.addProcess(this.newProcess.value), response => {
        if (response) {
          this.refresh()
          this.newProcess.reset()
        }
      }
    )
  }
}
