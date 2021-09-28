import {Component, OnInit} from '@angular/core';
import {RepositoryService} from "../../../data/repository/repository.service";
import {FormBuilder, Validators} from "@angular/forms";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
  }]
})
export class NewOrderComponent implements OnInit {

  internalOrdersFormArray = this.fb.array([])

  generalFormGroup = this.fb.group(
    {
      id: this.fb.control(0),
      product: this.fb.control(null, [Validators.required]),
      requestedQuantity: this.fb.control(null, [Validators.required]),
      commission: this.fb.control(null, [Validators.required]),
      client: this.fb.control(null, [Validators.required]),
      clientOrderCode: this.fb.control(null, [Validators.required]),
    }
  )
  datesFormGroup = this.fb.group({
    requestedDate: this.fb.control(null, [Validators.required]),
    startDate: this.fb.control(null),
    endDate: this.fb.control(null),
    expectedEndDate: this.fb.control(null),
  })


  addNewInternalOrder() {
    this.internalOrdersFormArray.push(
      this.fb.group({
        id: this.fb.control(0),
        productCode: this.fb.control(null, [Validators.required]),
        productQuantity: this.fb.control(null, [Validators.required]),
        rawCode: this.fb.control(null, [Validators.required]),
        rawQuantity: this.fb.control(null, [Validators.required]),
        operator: this.fb.control(null, [Validators.required]),
        processes: this.fb.array([]),
        externalTreatments: this.fb.control(null, [Validators.required]),

      })
    )
  }

  constructor(
    private repo: RepositoryService,
    private fb: FormBuilder
  ) {
  }

  ngOnInit(): void {
  }

}
