import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AccountSharedModule } from '~web/account-shared/account-shared.module';
import { DateTimeModule } from '~web/date-time/date-time.module';
import { DonationSharedModule } from '~web/donation-shared/donation-shared.module';
import { MapModule } from '~web/map/map.module';
import { PageListModule } from '~web/page-list/page-list.module';
import { SharedModule } from '~web/shared/shared.module';
import { DonationTeaserComponent } from './child-components/donation-teaser/donation-teaser.component';
import { PrimaryDonationInfoComponent } from './child-components/primary-donation-info/primary-donation-info.component';
import { DonateComponent } from './components/donate/donate.component';
import { DonationEditComponent } from './components/donation-edit/donation-edit.component';
import { DonationListComponent } from './components/donation-list/donation-list.component';
import { DonationComponent } from './components/donation/donation.component';
import { DonationRoutingModule } from './donation-routing.module';
import { DonationRouterLinkPipe } from './pipes/donation-router-link/donation-router-link.pipe';

@NgModule({
  declarations: [
    DonateComponent,
    DonationComponent,
    DonationEditComponent,
    DonationListComponent,
    DonationRouterLinkPipe,
    DonationTeaserComponent,
    PrimaryDonationInfoComponent
  ],
  imports: [
    DonationRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    AccountSharedModule,
    DateTimeModule,
    DonationSharedModule,
    PageListModule,
    MapModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    SharedModule
  ],
  exports: [
    DonationRouterLinkPipe
  ]
})
export class DonationModule {}
