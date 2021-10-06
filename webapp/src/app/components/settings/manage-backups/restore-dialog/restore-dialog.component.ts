import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SubscriberContextComponent} from "../../../../utils/subscriber-context.component";
import {RepositoryService} from "../../../../data/repository/repository.service";


@Component({
  selector: 'app-restore-dialog',
  templateUrl: './restore-dialog.component.html',
  styleUrls: ['./restore-dialog.component.css']
})
export class RestoreDialogComponent extends SubscriberContextComponent implements OnInit {

  restored?: boolean;
  isRestoring = false;

  constructor(private  repo: RepositoryService,
              @Inject(MAT_DIALOG_DATA) private data: File,
              public dialogRef: MatDialogRef<RestoreDialogComponent>) {
    super();
  }

  restoreBackup(): void {
    this.subscribeWithContext(
      this.repo.uploadBackupDB(this.data),
      response => {
        this.restored = response;
        this.isRestoring = false;
      }
    );
  }

  ngOnInit(): void {
  }

  startRestore(b: boolean): void {
    if (b) {
      this.isRestoring = true;
      this.restoreBackup();
    } else {
      this.dialogRef.close();
    }

  }
}
