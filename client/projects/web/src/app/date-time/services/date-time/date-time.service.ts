import { formatDate } from '@angular/common';
import { Injectable } from '@angular/core';
import { Account, DateTimeHelper, DateTimeRange, OperationHours, TimeRange } from '~shared';
import { ConstantsService } from '~web/shared/services/constants/constants.service';
export { TimeRange, DateTimeRange };

@Injectable({
  providedIn: 'root'
})
export class DateTimeService extends DateTimeHelper {

  constructor(
    private _constantsService: ConstantsService
  ) {
    super();
  }

  formatCurrentDate(): string {
    return this.formatDate(new Date());
  }

  formatCurrentTime(): string {
    return this.formatTime(new Date());
  }

  formatCurrentDateTime(): string {
    return this.formatDateTime(new Date());
  }

  formatDate(date: Date | string): string {
    return date ? formatDate(date, 'M/d/yyyy', 'en-US') : '';
  }

  formatTime(date: Date | string): string {
    date = this.toDate(date);
    return date ? formatDate(date, 'hh:mm aa', 'en-US') : '';
  }

  formatDateTime(date: Date | string): string {
    return `${this.formatDate(date)} ${this.formatTime(date)}`;
  }

  offsetDateMins(date: Date, minutes: number): Date {
    return new Date(date.getTime() + (minutes * 60000));
  }

  dateCeil5Mins(dateOrStr: Date | string): Date {
    const msIn5Mins = (1000 * 60 * 5);
    const date: Date = this.toDate(dateOrStr);
    return new Date(Math.ceil(date.getTime() / msIn5Mins) * msIn5Mins);
  }

  timeCeil5Mins(timeStr: string): string {
    return this.formatTime(this.dateCeil5Mins(timeStr));
  }

  timeAddHours(timeStr: string, hours: number): string {
    const date: Date = this.toDate(timeStr);
    return this.formatTime(this.addHours(date, hours));
  }

  getCurrentWeekday(): string {
    const date = new Date();
    const weekdayIdx: number = date.getDay();
    return this._constantsService.WEEKDAYS[weekdayIdx];
  }

  combineDateTime(date: Date, time: Date | string): Date {
    if (!date || !time) {
      return date;
    }

    time = this.timeStrToDate(time);
    const dateTime = new Date(date.getTime());
    if (time) {
      dateTime.setHours(time.getHours());
      dateTime.setMinutes(time.getMinutes());
      dateTime.setSeconds(time.getSeconds());
    }

    return dateTime;
  }

  genDateRangeFromAvailability(account: Account): DateTimeRange {
    const dateRange: DateTimeRange = {
      startDateTime: this.dateCeil5Mins(this.formatCurrentDateTime()),
      endDateTime: null,
    };
    const timeRange: TimeRange = this.genDefaultTimeRangeFromAvailability(account);
    if (timeRange && timeRange.endTime) {
      dateRange.endDateTime = new Date(`${this.formatCurrentDate()} ${timeRange.endTime}`);
    }
    return dateRange;
  }

  genDefaultTimeRangeFromAvailability(account: Account): TimeRange {
    const timeRange: TimeRange = { startTime: this.timeCeil5Mins(this.formatCurrentTime()), endTime: '' };
    if (account && account.operationHours) {
      const weekday: string = this.getCurrentWeekday();
      const weekdayOpHours: OperationHours = account.operationHours.find(
        (opHours: OperationHours) => (opHours.weekday === weekday)
      );
      if (weekdayOpHours) {
        const endTimeDate = new Date(`1/1/2000 ${weekdayOpHours.endTime}`);
        const startTimeDate = new Date(`1/1/2000 ${timeRange.startTime}`);
        if (weekdayOpHours && endTimeDate.getTime() > startTimeDate.getTime()) {
          timeRange.endTime = weekdayOpHours.endTime;
        }
      }
    }
    return timeRange;
  }

  genDateTimeRangeIncrements(rangeToSplit: DateTimeRange, stepMins = 15, allowPast = false): DateTimeRange[] {
    if (!rangeToSplit) { return []; }
    const timeRanges: DateTimeRange[] = [];
    const curDateTime = new Date();
    let startDateTime: Date = (allowPast || curDateTime < rangeToSplit.startDateTime)
      ? rangeToSplit.startDateTime
      : this.dateCeil5Mins(curDateTime);
    const totalEndDate: Date = rangeToSplit.endDateTime;

    // Ensure we can generate another increment before the pickup window (total) end date.
    while (startDateTime < totalEndDate) {
      const remainingMinutes: number = (totalEndDate.getTime() - startDateTime.getTime()) / 1000 / 60;
      const endDateTime = this.offsetDateMins(startDateTime, Math.min(stepMins, remainingMinutes));
      timeRanges.push({ startDateTime, endDateTime });
      startDateTime = endDateTime;
    }

    // If we have remaining time left that doesn't produce another full increment, then add it to last increment.
    if (startDateTime < totalEndDate && timeRanges.length > 0) {
      const lastIdx = timeRanges.length - 1;
      timeRanges[lastIdx].endDateTime = totalEndDate;
    }

    return timeRanges;
  }
}
