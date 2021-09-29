import {Component, OnInit} from '@angular/core';
import {RepositoryService} from "../../../data/repository/repository.service";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {MatSelect} from "@angular/material/select";
import {Order} from "../../../domain/model/data";

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true}
  }]
})
export class NewOrderComponent extends SubscriberContextComponent implements OnInit {

  processes: string[] = []


  internalOrdersFormArray = this.fb.array([],[Validators.required])

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

  formGroupWrapper = this.fb.group(
    {
      general: this.generalFormGroup,
      dates: this.datesFormGroup,
      internals: this.internalOrdersFormArray

    }
  )

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
        externalTreatments: this.fb.control(null),
      })
    )
  }

  constructor(
    private repo: RepositoryService,
    private fb: FormBuilder
  ) {
    super()
  }

  ngOnInit(): void {

    this.subscribeWithContext(
      this.repo.getAllProcesses(),
      response => {
        this.processes = response
      }
    )
  }

  castToFormGroup(internalControl: AbstractControl) {
    return internalControl as FormGroup
  }

  getInternalProcessesFormArray(internalControl: AbstractControl): FormArray {
    return internalControl.get('processes')! as FormArray
  }

  selectionChanged(internalControl: AbstractControl, select: MatSelect) {
    this.getInternalProcessesFormArray(internalControl).push(this.fb.control(select.value))
    select.value = ''
  }

  removeProcess(internalControl: AbstractControl, i: number) {
    this.getInternalProcessesFormArray(internalControl).removeAt(i)
  }

  parseDateToInstant(date: string): number {
    return Date.parse(date)
  }

  composeOrder(): Order {
    const order: Order = {
      id: this.generalFormGroup.value.id,
      product: this.generalFormGroup.value.product,
      requestedQuantity: this.generalFormGroup.value.requestedQuantity,
      commission: this.generalFormGroup.value.commission,
      client: this.generalFormGroup.value.client,
      clientOrderCode: this.generalFormGroup.value.clientOrderCode,

      requestedDate: this.parseDateToInstant(this.datesFormGroup.value.requestedDate),
      startDate: this.parseDateToInstant(this.datesFormGroup.value.startDate),
      endDate: this.parseDateToInstant(this.datesFormGroup.value.endDate),
      expectedEndDate: this.parseDateToInstant(this.datesFormGroup.value.expectedEndDate),
      internalOrders:this.internalOrdersFormArray.value
    }
    console.log(order)
    return order
  }

  removeInternal(internalIndex: number) {
    this.internalOrdersFormArray.removeAt(internalIndex)
  }
}
