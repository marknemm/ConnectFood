import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AdminDonationForm } from '~admin/admin-donation/forms/admin-donation.form';
import { AdminDonationSaveService } from '~admin/admin-donation/services/admin-donation-save/admin-donation-save.service';
import { Donation } from '~shared';
import { DateTimeService } from '~web/date-time/services/date-time/date-time.service';
import { DonationReadService } from '~web/donation/services/donation-read/donation-read.service';
import { PageProgressService } from '~web/shared/services/page-progress/page-progress.service';
import { UrlQueryService } from '~web/shared/services/url-query/url-query.service';

@Component({
  selector: 'foodweb-admin-donation-edit',
  templateUrl: './admin-donation-edit.component.html',
  styleUrls: ['./admin-donation-edit.component.scss'],
})
export class AdminDonationEditComponent implements OnInit, OnDestroy {

  private _destroy$ = new Subject();
  private _donationDetailsUrl = '';
  private _donationNotFound = false;
  private _formGroup: AdminDonationForm;
  private _originalDonation: Donation;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _adminDonationSaveService: AdminDonationSaveService,
    private _dateTimeService: DateTimeService,
    private _donationReadService: DonationReadService,
    private _pageProgressService: PageProgressService,
    private _router: Router,
    private _urlQueryService: UrlQueryService
  ) {}

  get donationNotFound(): boolean {
    return this._donationNotFound;
  }

  get formGroup(): AdminDonationForm {
    return this._formGroup;
  }

  ngOnInit() {
    this._formGroup = new AdminDonationForm(this._dateTimeService, this._destroy$);
    this._listenDonationChange();
  }

  private _listenDonationChange(): void {
    this._pageProgressService.activate(true);
    this._urlQueryService.listenUrlParamChange<number>('id', this._activatedRoute).pipe(
      switchMap((id: number) => this._donationReadService.getDonation(id))
    ).subscribe((donation: Donation) => this._setDonationData(donation));
  }

  private _setDonationData(donation: Donation): void {
    this._pageProgressService.deactivate();
    this._donationNotFound = !donation;
    this._originalDonation = donation;
    this._donationDetailsUrl = `/donation/${this._originalDonation.id}`;
    if (!this._donationNotFound) {
      this._formGroup.patchFromDonation(donation);
      this._formGroup.markAsPristine();
      this._formGroup.markAsUntouched();
    }
  }

  ngOnDestroy() {
    this._destroy$.next(); // Cleanup RxJS subscriptions.
  }

  submitDonation(): void {
    this._adminDonationSaveService.updateDonation(this.formGroup).subscribe(
      (savedDonation: Donation) => this._router.navigate([this._donationDetailsUrl], { state: savedDonation })
    );
  }

  cancelEdit(): void {
    this._router.navigate([this._donationDetailsUrl]);
  }

}
