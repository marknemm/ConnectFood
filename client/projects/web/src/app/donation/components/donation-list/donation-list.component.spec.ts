import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { DonationListComponent } from './donation-list.component';

describe('DonationListComponent', () => {
  let component: DonationListComponent;
  let fixture: ComponentFixture<DonationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DonationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DonationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
