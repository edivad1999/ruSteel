import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorOrdersComponent } from './operator-orders.component';

describe('OperatorOrdersComponent', () => {
  let component: OperatorOrdersComponent;
  let fixture: ComponentFixture<OperatorOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorOrdersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
