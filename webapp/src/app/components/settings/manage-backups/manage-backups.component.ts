import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {RestoreDialogComponent} from './restore-dialog/restore-dialog.component';
import {SubscriberContextComponent} from "../../../utils/subscriber-context.component";
import {RepositoryService} from "../../../data/repository/repository.service";
import {saveAs} from "file-saver";

@Component({
  selector: 'app-manage-backups',
  templateUrl: './manage-backups.component.html',
  styleUrls: ['./manage-backups.component.css']
})
export class ManageBackupsComponent extends SubscriberContextComponent implements OnInit {

  constructor(
    private dialog: MatDialog,
    private repo: RepositoryService) {

    super();
  }

  ngOnInit(): void {
  }

  downloadBackup() {
    this.subscribeWithContext(
      this.repo.getAllOrders(),
      value => {
        const file = new Blob([JSON.stringify(value,null,"\t")], {type: '.json'});
        saveAs(file, `backup_${Date.now().toString()}.json`)
      }
    )
  }

  onBackUpFileSelected(target: any, backupFileInput: HTMLInputElement): void {
    const files = target.files as File[];
    if (files.length !== 0) {
      this.dialog.open(RestoreDialogComponent, {
        data: files[0],
        disableClose: true
      });

    }
    if (backupFileInput.value !== '') {
      backupFileInput.value = '';
    }
  }
}
