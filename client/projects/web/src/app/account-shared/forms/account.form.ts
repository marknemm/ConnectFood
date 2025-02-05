import { Validators } from '@angular/forms';
import { Account, AccountType, NotificationSettings, TimeRange } from '~shared';
import { ContactInfoForm } from '~web/account-shared/forms/contact-info.form';
import { OperationHoursForm } from '~web/account-shared/forms/operation-hours.form';
import { OrganizationForm } from '~web/account-shared/forms/organization.form';
import { VolunteerForm } from '~web/account-shared/forms/volunteer.form';
import { NotificationSettingsForm } from '~web/account/forms/notification-settings.form';
import { TFormGroup } from '~web/forms';
import { PasswordForm, PasswordFormT } from '~web/password/forms/password.form';
export { PasswordFormT };

export class AccountForm extends TFormGroup<AccountFormT> {

  constructor(config: AccountFormConfig) {
    super({
      id: undefined,
      accountType: [undefined, Validators.required],
      contactInfo: new ContactInfoForm(),
      notificationSettings: new NotificationSettingsForm(),
      password: new PasswordForm({ formMode: config.formMode }),
      profileImg: '',
      operationHours: new OperationHoursForm(),
      organization: new OrganizationForm(),
      username: ['', Validators.required],
      volunteer: new VolunteerForm(),
    });

    // Listen for accountType value to update.
    this.get('accountType').valueChanges.subscribe(
      this._onAccountTypeUpdate.bind(this)
    );

    // Initialize the form value if provided.
    if (config.value) {
      this.patchValue(config.value);
    }
  }

  get password(): string {
    return this.get('password').value.password;
  }

  get passwordFormValue(): PasswordFormT {
    return this.get('password').value;
  }

  private _onAccountTypeUpdate(accountType: AccountType): void {
    if (accountType === AccountType.Volunteer) {
      this.get('volunteer').enable();
      this.get('organization').disable();
    } else {
      this.get('volunteer').disable();
      this.get('organization').enable();
    }
  }

  patchValue(value: Partial<AccountFormT | Account>): void {
    if (!value.hasOwnProperty('notificationSettings')) {
     (<NotificationSettingsForm>this.get('notificationSettings')).patchValue(value.contactInfo);
    }
    super.patchValue(<Partial<AccountFormT>>value);
  }

  toAccount(): Account {
    const accountFormVal: AccountFormT & Account = <any>this.getRawValue();
    delete accountFormVal.password;
    (<Account>accountFormVal).operationHours = (<OperationHoursForm>this.get('operationHours')).toOperationHours();
    Object.keys(accountFormVal.notificationSettings).forEach((notificationSettingKey: string) => {
      if (accountFormVal.notificationSettings[notificationSettingKey] != null) {
        accountFormVal.contactInfo[notificationSettingKey] = accountFormVal.notificationSettings[notificationSettingKey];
      }
    });
    delete accountFormVal.notificationSettings;
    (accountFormVal.accountType === AccountType.Donor)
      ? delete accountFormVal.organization.receiver
      : delete accountFormVal.organization.donor;
    return <Account>accountFormVal;
  }
}

export type AccountFormMode = 'Account' | 'Signup';

export interface AccountFormConfig {
  formMode?: AccountFormMode;
  value?: Partial<AccountFormT> | Partial<Account>;
}

export interface AccountFormT extends Omit<Account, 'operationHours'> {
  notificationSettings: NotificationSettings;
  operationHours: OperationHoursFormT;
  password: PasswordFormT;
}

export interface OperationHoursFormT {
  limitOperationHours: boolean;
  Sunday: TimeRange[];
  Monday: TimeRange[];
  Tuesday: TimeRange[];
  Wednesday: TimeRange[];
  Thursday: TimeRange[];
  Friday: TimeRange[];
  Saturday: TimeRange[];
}

export type AccountFormKey = keyof AccountFormT;
