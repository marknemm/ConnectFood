import 'jasmine';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DateTimeRangeRadioDialogComponent } from './date-time-range-radio-dialog.component';

describe('DateTimeRangeRadioDialogComponent', () => {
  let component: DateTimeRangeRadioDialogComponent;
  let fixture: ComponentFixture<DateTimeRangeRadioDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DateTimeRangeRadioDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateTimeRangeRadioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
