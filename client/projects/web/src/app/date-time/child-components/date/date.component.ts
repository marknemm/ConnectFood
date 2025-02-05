import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { DateFilterFn } from '@angular/material/datepicker';
import { FloatLabelType } from '@angular/material/form-field';
import { FormFieldService, TFormControl } from '~web/forms';

@Component({
  selector: 'foodweb-date',
  templateUrl: './date.component.html',
  styleUrls: ['./date.component.scss'],
  providers: [FormFieldService]
})
export class DateComponent implements OnInit {

  @Input() allowClear = false;
  @Input() bold = false;
  @Input() dateFilter: DateFilterFn<Date>;
  @Input() defaultDate: Date;
  @Input() editable = false;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() floatLabels: FloatLabelType = 'auto';
  @Input() maxDate: Date;
  @Input() minDate: Date;
  @Input() minWidth = '';
  @Input() placeholder = '';
  @Input() get value(): Date     { return this._formFieldService.value; }
           set value(date: Date) { this._formFieldService.valueIn(date); }

  @Output() valueChanges: EventEmitter<Date> = this._formFieldService.valueChangesEmitter;

  constructor(
    private _formFieldService: FormFieldService<Date>
  ) {}

  get formControl(): TFormControl<Date> {
    return this._formFieldService.control;
  }

  /**
   * Whether or not to show the clear button for the date input field.
   */
  get showClearButton(): boolean {
    return (this.allowClear && this.formControl?.value && this.formControl.enabled);
  }

  ngOnInit(): void {
    // setTimeout(() => this._formFieldService.injectControl());
    this._formFieldService.injectControl();
  }

  /**
   * Clears the date input field.
   * @param event The mouse (button) click event.
   */
  clearDate(event: MouseEvent): void {
    this.formControl.reset();
    event.stopPropagation();
  }
}
