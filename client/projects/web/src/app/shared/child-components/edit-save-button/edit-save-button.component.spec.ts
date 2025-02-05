import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSaveButtonComponent } from './edit-save-button.component';

describe('EditSaveButtonComponent', () => {
  let component: EditSaveButtonComponent;
  let fixture: ComponentFixture<EditSaveButtonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSaveButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSaveButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
