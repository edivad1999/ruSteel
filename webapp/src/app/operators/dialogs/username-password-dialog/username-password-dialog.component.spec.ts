import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsernamePasswordDialogComponent } from './username-password-dialog.component';

describe('UsernamePasswordDialogComponent', () => {
  let component: UsernamePasswordDialogComponent;
  let fixture: ComponentFixture<UsernamePasswordDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsernamePasswordDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernamePasswordDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
