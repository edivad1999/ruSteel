import {Component, OnInit} from '@angular/core';
import {RepositoryService} from "../../../data/repository/repository.service";
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {STEPPER_GLOBAL_OPTIONS} from "@angular/cdk/stepper";
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {MatSelect} from "@angular/material/select";
import {Completion, CreateInternalOrderRequest, CreateOrderRequest, InternalOrder, Order} from "../../../domain/model/data";
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

  completion: Completion = {
    productColumn: [],
    commissionColumn: [],
    clientOrderCodeColumn: [],
    clientColumn: [],
    externalTreatmentsColumn: [],
    operatorColumn: [],
    productCodeColumn: [],
    rawCodeColumn: []
  }

  processes: string[] = []
  editOrder: Order | null = null
  internalOrdersFormArray = this.fb.array([], [Validators.required])

  ngOnInit(): void {
    this.subscribeWithContext(
      this.route.paramMap.pipe(
        map(m => m.get('id')),
        map(id => {
            if (id) {
              this.subscribeWithContext(this.repo.getOrderById(id), response => {
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

    this.subscribeWithContext(this.repo.getCompletion(), value => {
      this.completion = value
    })
  }

  getFilteredCompletion(control: FormControl, baseAssociatedCompletion: string[]): string[] {

    return this._filter(control.value ? control.value : '', baseAssociatedCompletion)
  }

  private _filter(value: string, array: string[]): string[] {
    const filterValue = value.toLowerCase();

    return array.filter(option => option.toLowerCase().includes(filterValue));
  }

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
        id: this.fb.control('dummy'),
        productCode: this.fb.control(null, [Validators.required]),
        productQuantity: this.fb.control(null, [Validators.required]),
        rawCode: this.fb.control(null, [Validators.required]),
        rawQuantity: this.fb.control(null, [Validators.required]),
        operator: this.fb.control(null, [Validators.required]),
        processes: this.fb.array([]),
        externalTreatments: this.fb.control(null),
        startDate: this.fb.control(null),
        endDate: this.fb.control(null),
        expectedEndDate: this.fb.control(null),
      })
    )
  }

  constructor(
    private router: Router,
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
              startDate: this.fb.control(internal.startDate ? this.convertToInputDateCompatible(new Date(internal.startDate)) : null),
              endDate: this.fb.control(internal.endDate ? this.convertToInputDateCompatible(new Date(internal.endDate)) : null),
              expectedEndDate: this.fb.control(internal.expectedEndDate ? this.convertToInputDateCompatible(new Date(internal.expectedEndDate)) : null),

            })
          )
        }
      )
    }


  }

  getControlFromAbstract(a: AbstractControl | null) {
    return a as FormControl
  }

  convertToInputDateCompatible(date: Date): string {

    return date.toISOString().split('T')[0];
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
      internalOrders: this.internalOrdersFormArrayToInternalOrders(this.internalOrdersFormArray)
    }
    return order
  }

  internalOrdersFormArrayToInternalOrders(fa: FormArray): InternalOrder[] {
    return fa.controls.map(
      control => {
        const internal: InternalOrder = {
          id: control.value.id,//when creating or editing id will be ignored
          productCode: control.value.productCode,
          productQuantity: control.value.productQuantity,
          rawCode: control.value.rawCode,
          rawQuantity: control.value.rawQuantity,
          operator: control.value.operator,
          processes: control.value.processes,
          externalTreatments: control.value.externalTreatments,
          startDate: this.parseDateToInstant(control.value.startDate),
          endDate: this.parseDateToInstant(control.value.endDate),
          expectedEndDate: this.parseDateToInstant(control.value.expectedEndDate)
        }
        return internal
      }
    )
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
    const orderRequest: CreateOrderRequest = {
      product: order.product,
      clientOrderCode: order.clientOrderCode,
      requestedDate: order.requestedDate,
      commission: order.commission,
      requestedQuantity: order.requestedQuantity,
      client: order.client,
      internalOrders: order.internalOrders.map(internal => {
        const createInternal: CreateInternalOrderRequest = {
          endDate: internal.endDate,
          externalTreatments: internal.externalTreatments,
          expectedEndDate: internal.expectedEndDate,
          rawCode: internal.rawCode,
          rawQuantity: internal.rawQuantity,
          startDate: internal.startDate,
          operator: internal.operator,
          productCode: internal.productCode,
          productQuantity: internal.productQuantity,
          processes: internal.processes,
        }
        return createInternal
      }),
    }

    this.subscribeWithContext(this.repo.newOrder(orderRequest), response => {
      if (response) {
        this.snackbar.open("Dati caricati correttamente", "chiudi")
        this.router.navigateByUrl('/home')

      }
    })
  }

  deleteById(id: string,) {
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
        this.router.navigateByUrl('/home')
      }
    })
  }
}
