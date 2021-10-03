import {Component, OnInit} from '@angular/core';
import {RepositoryService} from "../../../data/repository/repository.service";
import {AbstractControl, FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {MatSelect} from "@angular/material/select";
import {Order} from "../../../domain/model/data";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {map} from "rxjs/operators";

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
  editOrder: Order | null = null
  internalOrdersFormArray = this.fb.array([], [Validators.required])

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
    private router:Router,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private repo: RepositoryService,
    private fb: FormBuilder
  ) {
    super()
  }

  setForm(o: Order) {
    this.generalFormGroup.get("id")?.setValue(o.id)
    this.generalFormGroup.get("product")?.setValue(o.product)
    this.generalFormGroup.get("requestedQuantity")?.setValue(o.requestedQuantity)
    this.generalFormGroup.get("commission")?.setValue(o.commission)
    this.generalFormGroup.get("client")?.setValue(o.client)
    this.generalFormGroup.get("clientOrderCode")?.setValue(o.clientOrderCode)
    this.datesFormGroup.get("requestedDate")?.setValue(this.convertToInputDateCompatible(new Date(o.requestedDate)))
    this.datesFormGroup.get("startDate")?.setValue(o.startDate ? this.convertToInputDateCompatible(new Date(o.startDate)) : null)
    this.datesFormGroup.get("endDate")?.setValue(o.endDate ? this.convertToInputDateCompatible(new Date(o.endDate)) : null)
    this.datesFormGroup.get("expectedEndDate")?.setValue(o.expectedEndDate ? this.convertToInputDateCompatible(new Date(o.expectedEndDate)) : null)
    if (o.internalOrders.length > 0) {
      o.internalOrders.forEach(internal => {
          this.internalOrdersFormArray.push(
            this.fb.group({
              id: this.fb.control(internal.id),
              productCode: this.fb.control(internal.productCode, [Validators.required]),
              productQuantity: this.fb.control(internal.productQuantity, [Validators.required]),
              rawCode: this.fb.control(internal.rawCode, [Validators.required]),
              rawQuantity: this.fb.control(internal.rawQuantity, [Validators.required]),
              operator: this.fb.control(internal.operator, [Validators.required]),
              processes: this.fb.array(internal.processes),
              externalTreatments: this.fb.control(internal.externalTreatments),
            })
          )
        }
      )
    }


  }

  convertToInputDateCompatible(date: Date): string {

    return date.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.subscribeWithContext(
      this.route.paramMap.pipe(
        map(m => m.get('id')),
        map(id => {
            if (id) {
              this.subscribeWithContext(this.repo.getOrderById(+id), response => {
                this.editOrder = response
                this.setForm(response)
              })
            }
          }
        )
      ))
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
      internalOrders: this.internalOrdersFormArray.value
    }
    return order
  }

  removeInternal(internalIndex: number) {
    this.internalOrdersFormArray.removeAt(internalIndex)
  }

  saveOrder(order: Order) {
    // @ts-ignore
    Object.keys(order).forEach(key => order[key] === undefined || order[key] === '' ? delete order[key] : {});
    order.internalOrders.forEach(internal => {
      // @ts-ignore
      Object.keys(internal).forEach(key => internal[key] === undefined || internal[key] === '' ? delete internal[key] : {});

    })
    this.subscribeWithContext(this.repo.newOrder(order), response => {
      if (response) {
        this.snackbar.open("Dati caricati correttamente", "chiudi")
      }
    })
  }

  deleteById(id: number,) {
    this.subscribeWithContext(this.repo.removeOrderbyId(id), value => {
        if (value) {
          this.snackbar.open("Cancellato correttamente", "chiudi")
          this.router.navigateByUrl('/home')
        }

      }
    )

  }

  modifyOrder(order: Order) {
    console.log(order)
    // @ts-ignore
    Object.keys(order).forEach(key => order[key] === undefined || order[key] === '' ? delete order[key] : {});

    order.internalOrders.forEach(internal => {
      // @ts-ignore
      Object.keys(internal).forEach(key => internal[key] === undefined || internal[key] === '' ? delete internal[key] : {});

    })
    console.log(order)
    this.subscribeWithContext(this.repo.editOrderbyId(this.editOrder!.id, order), response => {
      if (response) {
        this.snackbar.open("Dati caricati correttamente", "chiudi")
      }
    })
  }
}
