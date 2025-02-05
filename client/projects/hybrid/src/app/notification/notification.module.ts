import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AccountSharedModule } from '~hybrid/account-shared/account-shared.module';
import { PageListModule } from '~hybrid/page-list/page-list.module';
import { SharedModule } from '~hybrid/shared/shared.module';
import { NotificationModule as WebNotificationModule } from '~web/notification/notification.module';
import { NotificationComponent } from './child-components/notification/notification.component';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationRoutingModule } from './notification-routing.module';

@NgModule({
  declarations: [
    NotificationListComponent,
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    IonicModule,
    NotificationRoutingModule,
    WebNotificationModule,
    AccountSharedModule,
    PageListModule,
    SharedModule,
  ],
  exports: [
    WebNotificationModule,
  ]
})
export class NotificationModule {}
