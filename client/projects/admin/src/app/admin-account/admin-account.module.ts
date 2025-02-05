import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { QuillModule } from 'ngx-quill';
import { AdminAccountSharedModule } from '~admin/admin-account-shared/admin-account-shared.module';
import { AccountModule } from '~web/account/account.module';
import { PageListModule } from '~web/page-list/page-list.module';
import { SharedModule } from '~web/shared/shared.module';
import { AdminAccountRoutingModule } from './admin-account-routing.module';
import { AdminAccountFiltersComponent } from './child-components/admin-account-filters/admin-account-filters.component';
import { AdminAccountCreateComponent } from './components/admin-account-create/admin-account-create.component';
import { AdminAccountListComponent } from './components/admin-account-list/admin-account-list.component';
import { AdminAccountMessageComponent } from './components/admin-account-message/admin-account-message.component';
import { AdminAccountComponent } from './components/admin-account/admin-account.component';

@NgModule({
  declarations: [
    AdminAccountCreateComponent,
    AdminAccountComponent,
    AdminAccountFiltersComponent,
    AdminAccountListComponent,
    AdminAccountMessageComponent,
  ],
  imports: [
    AdminAccountRoutingModule,
    CommonModule,
    AccountModule,
    AdminAccountSharedModule,
    PageListModule,
    FontAwesomeModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatTooltipModule,
    QuillModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  exports: [
    AccountModule, // Works as if we are extending the base Web AccountModule.
  ]
})
export class AdminAccountModule {}
