import { Component } from '@angular/core';
import { AccountCreationFormComponent as WebAccountCreationFormComponent } from '~web/account-shared/child-components/account-creation-form/account-creation-form.component';
import { FormFieldService } from '~web/forms';

@Component({
  selector: 'foodweb-hybrid-account-creation-form',
  templateUrl: './account-creation-form.component.html',
  styleUrls: ['./account-creation-form.component.scss'],
  providers: [FormFieldService]
})
export class AccountCreationFormComponent extends WebAccountCreationFormComponent {}
