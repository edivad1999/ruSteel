import {Component, OnInit} from '@angular/core';
import {SubscriberContextComponent} from "../../utils/subscriber-context.component";
import {BarcodeFormat} from "@zxing/library";
import {InternalOrder, QrResponse} from "../../domain/model/data";
import {RepositoryService} from "../../data/repository/repository.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.css']
})
export class QrComponent extends SubscriberContextComponent implements OnInit {
  allowedFormats = [BarcodeFormat.QR_CODE, BarcodeFormat.EAN_13, BarcodeFormat.CODE_128, BarcodeFormat.DATA_MATRIX /*, ...*/];
  qrResultString: QrResponse | null = null;
  internalOrder: InternalOrder | null = null
  scanErrorMessage: string | null = null

  onCodeResult(resultString: string) {
    this.qrResultString = this.analyzeQrString(atob(resultString));
    if (this.qrResultString) {
      this.scanErrorMessage = null
      this.subscribeWithContext(this.repo.getInteralOrderById(this.qrResultString.id), resp => {
        if (resp) {
          this.internalOrder = resp
          this.scanErrorMessage=null
        }else{
          this.scanErrorMessage="Non esistono lavorazioni associate al QR code"
        }
      })
    } else {
      this.scanErrorMessage = "Scannerizzato un codice non compatibile"
    }

  }

  getOrderDate(instant: number) {
    return new Date(instant).toLocaleDateString()

  }

  analyzeQrString(qr: string): QrResponse | null {
    const arr = qr.split(', ')
    const resp: QrResponse = {id: arr[0], action: arr[1]}
    if (resp.action === "end" || resp.action === "start") {
      return resp
    } else return null
  }


  constructor(private repo: RepositoryService, private snackbar: MatSnackBar, private router: Router) {
    super()
  }

  ngOnInit(): void {
  }

  rescan() {
    this.qrResultString = null
    this.internalOrder = null
  }

  setInternal() {
    if (this.qrResultString)
      this.subscribeWithContext(
        this.repo.setInternalDate(this.qrResultString.id, this.qrResultString.action, Date.now()), action => {
          if (action) {
            this.snackbar.open("Dati impostati", "chiudi")
            this.router.navigateByUrl('/home')

          }
        }
      )
  }
}
