import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperatorSingleOrderComponent } from './operator-single-order.component';

describe('OperatorSingleOrderComponent', () => {
  let component: OperatorSingleOrderComponent;
  let fixture: ComponentFixture<OperatorSingleOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OperatorSingleOrderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OperatorSingleOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
