import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { FloatLabelType } from '@angular/material/form-field';
import { DateTimeForm, DateTimeFormT } from '~web/date-time/forms/date-time.form';
import { DateTimeService } from '~web/date-time/services/date-time/date-time.service';
import { FormFieldService } from '~web/forms';

@Component({
  selector: 'foodweb-date-time',
  templateUrl: './date-time.component.html',
  styleUrls: ['./date-time.component.scss'],
  providers: [FormFieldService]
})
export class DateTimeComponent implements OnInit {

  @Input() allowClear = false;
  @Input() allowUndefTime = false;
  @Input() boldDate = false;
  @Input() boldTime = false;
  @Input() datePlaceholder = 'Date';
  @Input() defaultDate: Date;
  @Input() defaultTime = '12:00 pm';
  @Input() editable = false;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() excludeDateDisplay = false;
  @Input() excludeTimeDisplay = false;
  @Input() floatLabels: FloatLabelType = 'auto';
  @Input() inlineFields = true;
  @Input() maxDate: Date;
  @Input() minDate: Date = new Date();
  @Input() minDateWidth = '';
  @Input() minutesGap = 5;
  @Input() primaryLabel = '';
  @Input() timePlaceholder = 'Time';
  @Input() get value(): Date     { return this._formFieldService.valueOut(); }
           set value(date: Date) { this._formFieldService.valueIn(date); }

  @Output() valueChanges: EventEmitter<Date> = this._formFieldService.valueChangesEmitter;

  constructor(
    private _dateTimeService: DateTimeService,
    private _formFieldService: FormFieldService<DateTimeForm, Date>,
  ) {
    this._formFieldService.registerControl(new DateTimeForm(this._dateTimeService), {
      valueInConverter: (date: Date) => ({
        date: this._dateTimeService.toDate(date),
        time: this._dateTimeService.formatTime(date)
      }),
      valueOutConverter: (dateTime: DateTimeFormT) =>
        this._dateTimeService.combineDateTime(dateTime.date, dateTime.time)
    });
  }

  /**
   * Acts an an internal form group. The formControl exposed to the outside will gather this form's data
   * together as a single Date value.
   */
  get dateTimeForm(): DateTimeForm {
    return this._formFieldService.control;
  }

  ngOnInit(): void {
    const required: boolean = this._formFieldService.formValidation.hasRequiredValidator(this._formFieldService.externalControl);
    this.dateTimeForm.init({ defaultDate: this.defaultDate, required });
  }
}
