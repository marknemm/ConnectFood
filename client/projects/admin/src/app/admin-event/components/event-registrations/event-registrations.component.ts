import { formatDate } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { EventIdentifierForm } from '~admin/admin-event/forms/event-identifier.form';
import { EventRegistrationsService } from '~admin/admin-event/services/event-registrations/event-registrations.service';
import { DeepReadonly, EventRegistration, FeaturedEvent } from '~shared';
import { ImmutableStore } from '~web/shared/classes/immutable-store';
import { TableDataSource } from '~web/table/interfaces/table-data-source';

@Component({
  selector: 'foodweb-admin-event-registrations',
  templateUrl: './event-registrations.component.html',
  styleUrls: ['./event-registrations.component.scss']
})
export class EventRegistrationsComponent implements OnInit, OnDestroy {

  readonly eventIdentifierForm = new EventIdentifierForm();
  readonly registrationsDataSource = new TableDataSource<EventRegistration>([], [
    { name: 'fullName', visibleName: 'Name' }, 'email', { name: 'phoneNumber', minWidth: '120px' }
  ]);
  readonly registrationsDisplayCols = ['fullName', 'email', 'phoneNumber'];

  private _destroy$ = new Subject();
  private _eventRegistrationsTitle = 'Loading Registrations...';

  constructor(
    public eventRegistrationService: EventRegistrationsService,
    private _activatedRoute: ActivatedRoute,
  ) {}

  get eventRegistrationsTitle(): string {
    return this._eventRegistrationsTitle;
  }

  get featuredEventStore(): ImmutableStore<FeaturedEvent> {
    return this.eventRegistrationService.featuredEventStore;
  }

  ngOnInit() {
    this.eventRegistrationService.getEventOnIdUrlParamChange(this._activatedRoute);
    this.featuredEventStore.getValueUpdates$(this._destroy$).subscribe(
      (featuredEvent: DeepReadonly<FeaturedEvent>) => this._onFeatureedEventUpdate(featuredEvent)
    );
  }

  private _onFeatureedEventUpdate(featuredEvent: DeepReadonly<FeaturedEvent>): void {
    const eventDateStr: string = formatDate(featuredEvent.date, 'short', 'en-US');
    this._eventRegistrationsTitle = `<strong>${featuredEvent.title}</strong> - ${eventDateStr}`;
    this.registrationsDataSource.data = <EventRegistration[]>(featuredEvent?.registrations ? featuredEvent.registrations : []);
  }

  ngOnDestroy() {
    this._destroy$.next(); // Cleanup observables.
  }

}
