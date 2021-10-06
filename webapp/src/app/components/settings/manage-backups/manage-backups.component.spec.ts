import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageBackupsComponent } from './manage-backups.component';

describe('ManageBackupsComponent', () => {
  let component: ManageBackupsComponent;
  let fixture: ComponentFixture<ManageBackupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageBackupsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageBackupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
